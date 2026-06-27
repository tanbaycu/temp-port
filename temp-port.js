#!/usr/bin/env node
const inquirer = require('inquirer');
const chalk = require('chalk');
const boxen = require('boxen');
const gradient = require('gradient-string');
const figlet = require('figlet');
const ora = require('ora');
const localtunnel = require('localtunnel');
const qrcode = require('qrcode-terminal');
const net = require('net');
const fs = require('fs'); 
const path = require('path');
const os = require('os');
const { program } = require('commander');
const clipboardy = require('clipboardy');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

const CONFIG_FILE = path.join(os.homedir(), '.temp-port-config.json');

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }
    } catch(e) {}
    return { port: 3000, subdomain: '' };
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function copyToClipboard(text) {
    try {
        clipboardy.writeSync(text);
        return true;
    } catch(e) {
        return false;
    }
}

function cls() { console.clear(); }

function showHeader() {
    cls();
    const logoText = figlet.textSync('TEMP PORT', { font: 'Slant' });
    console.log(gradient.pastel.multiline(logoText));
    console.log(boxen(
        chalk.cyan.bold('Đưa Localhost ra toàn cầu với Custom Subdomain & Mã QR') + '\n\n' +
        chalk.gray('Peak Edition • Tốc độ cao • Không cần cài đặt rườm rà') + '\n\n' +
        chalk.dim('Tác giả: ') + gradient.cristal('tanbaycu'),
        {
            padding: 1, margin: { top: 0, bottom: 1 },
            borderStyle: 'round', borderColor: 'cyan', textAlignment: 'center'
        }
    ));
}

const COMMON_DEV_PORTS = [
    { port: 3000, label: 'React / Next.js / Node' },
    { port: 3001, label: 'React / Node (Phụ)' },
    { port: 4000, label: 'Express / Jekyll' },
    { port: 4200, label: 'Angular' },
    { port: 5000, label: 'Flask / .NET' },
    { port: 5173, label: 'Vite (React/Vue/Svelte)' },
    { port: 8000, label: 'Django / Laravel / PHP' },
    { port: 8080, label: 'Spring Boot / Vue CLI' },
    { port: 8081, label: 'React Native Metro' }
];

async function checkPortHealth(port, timeout = 1500) {
    return new Promise((resolve) => {
        const client = new net.Socket();
        client.setTimeout(timeout);
        
        client.on('connect', () => {
            client.destroy();
            resolve(true); // Cổng đang mở
        });
        
        client.on('timeout', () => {
            client.destroy();
            resolve(false);
        });
        
        client.on('error', () => {
            client.destroy();
            resolve(false); // Cổng đang đóng
        });
        
        client.connect(port, '127.0.0.1');
    });
}

async function scanActiveDevPorts() {
    const activePorts = [];
    for (const dev of COMMON_DEV_PORTS) {
        const isAlive = await checkPortHealth(dev.port, 200);
        if (isAlive) {
            activePorts.push(dev);
        }
    }
    return activePorts;
}

async function tempPort(cliPort, cliSubdomain, cliHost) {
    const sessionStats = { startTime: Date.now(), total: 0, methods: {} };
    console.log(chalk.yellow('\n🌐 Bắt đầu khởi tạo Đường hầm Internet...'));
    const config = loadConfig();
    
    let selectedPort = cliPort || null;
    let finalSubdomain = cliSubdomain !== undefined ? cliSubdomain : null;

    if (!selectedPort) {
        // Auto-scan ports
        const scanSpinner = ora('Đang tự động dò tìm các Server đang chạy...').start();
        const activePorts = await scanActiveDevPorts();
        scanSpinner.stop();

        if (activePorts.length > 0) {
            console.log(chalk.green('✅ Đã tìm thấy các Server đang chạy trên máy bạn!'));
            const choices = activePorts.map(p => ({
                name: `🟢 Port ${p.port} (${p.label}) - Đang hoạt động`,
                value: p.port
            }));
            choices.push(new inquirer.Separator());
            choices.push({ name: '✍️  Nhập Port thủ công...', value: 'manual' });

            const { portChoice } = await inquirer.prompt([{
                type: 'list',
                name: 'portChoice',
                message: 'Chọn Port bạn muốn đẩy lên Internet:',
                choices: choices
            }]);

            selectedPort = portChoice;
        }

        if (selectedPort === null || selectedPort === 'manual') {
            const { portInput } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'portInput',
                    message: 'Nhập số Port Localhost đang chạy (1-65535):',
                    default: config.port,
                    validate: v => {
                        if (v > 0 && v < 65536) return true;
                        return 'Port không hợp lệ! Vui lòng nhập số (ví dụ: 3000)';
                    }
                }
            ]);
            selectedPort = portInput;
            
            // Double check manual port
            const healthSpinner = ora('Đang kiểm tra Port...').start();
            const isHealthy = await checkPortHealth(selectedPort);
            if (isHealthy) {
                healthSpinner.succeed(chalk.green(`Cổng ${selectedPort} đang hoạt động tốt!`));
            } else {
                healthSpinner.warn(chalk.yellow(`Cổng ${selectedPort} hiện ĐANG ĐÓNG hoặc chưa bật Server!`));
                const { proceed } = await inquirer.prompt([{
                    type: 'confirm', name: 'proceed', message: 'Bạn vẫn muốn tiếp tục tạo Tunnel cho Cổng này chứ?', default: false
                }]);
                if (!proceed) return;
            }
        }
    } else {
        const isHealthy = await checkPortHealth(selectedPort);
        if (!isHealthy) {
            console.log(chalk.yellow(`⚠️  Cảnh báo: Cổng ${selectedPort} hiện ĐANG ĐÓNG hoặc chưa bật Server!`));
        }
    }

    if (finalSubdomain === null) {
        const { subdomain } = await inquirer.prompt([
            {
                type: 'input',
                name: 'subdomain',
                message: 'Nhập Subdomain mong muốn (để trống tạo link ngẫu nhiên):',
                default: config.subdomain,
                validate: v => {
                    if (v.trim() === '') return true;
                    if (/^[a-z0-9-]+$/.test(v)) return true;
                    return 'Subdomain chỉ được chứa chữ cái thường, số và dấu gạch ngang (-) !';
                }
            }
        ]);
        finalSubdomain = subdomain.trim();
    }

    saveConfig({ port: selectedPort, subdomain: finalSubdomain });
    const port = selectedPort;
    const subdomain = finalSubdomain;
    let currentHost = cliHost || null;

    let retryCount = 0;
    const MAX_RETRIES = 3;
    let isIntentionalClose = false;
    let currentTunnel = null;

    const onSigint = () => {
        isIntentionalClose = true;
        if (currentTunnel) currentTunnel.close();

        const uptimeSeconds = Math.floor((Date.now() - sessionStats.startTime) / 1000);
        let methodsStr = '';
        for (const [method, count] of Object.entries(sessionStats.methods)) {
            methodsStr += `  - ${method}: ${count}\n`;
        }
        if (methodsStr === '') methodsStr = '  (Chưa có request nào)\n';
        
        console.log('\n' + boxen(
            chalk.cyan.bold('📊 SESSION SUMMARY DASHBOARD') + '\n\n' +
            chalk.white('⏱  Uptime: ') + chalk.yellow(`${uptimeSeconds} giây`) + '\n' +
            chalk.white('🌐 Tổng Request: ') + chalk.green(sessionStats.total) + '\n\n' +
            chalk.white('Chi tiết theo Method:\n') + chalk.gray(methodsStr),
            { padding: 1, borderColor: 'magenta', borderStyle: 'round' }
        ));

        process.removeListener('SIGINT', onSigint);
        process.exit(0);
    };
    process.on('SIGINT', onSigint);

    while (retryCount <= MAX_RETRIES && !isIntentionalClose) {
        const tunnelSpinner = ora(retryCount === 0 ? 'Đang xuyên thủng đường hầm (Tunnel)...' : `Đang thử kết nối lại... (${retryCount}/${MAX_RETRIES})`).start();
        try {
            const tunnelOptions = { port: port };
            if (subdomain && subdomain.trim() !== '') tunnelOptions.subdomain = subdomain.trim();
            if (currentHost) tunnelOptions.host = currentHost;
            
            const tunnel = await localtunnel(tunnelOptions);
            currentTunnel = tunnel;
            tunnelSpinner.succeed(chalk.green('Tunnel đã mở thành công!'));

            if (retryCount === 0) {
                copyToClipboard(tunnel.url);
                console.log(boxen(
                    chalk.white('Local:  ') + chalk.gray(`http://localhost:${port}`) + '\n' +
                    chalk.white('Public: ') + chalk.cyan.underline.bold(tunnel.url) + '\n\n' +
                    chalk.green('✅ Public URL đã được tự động Copy vào Clipboard!') + '\n\n' +
                    chalk.yellow('⚠️  Lưu ý IP Public: ') + chalk.dim('Lần truy cập đầu tiên cần nhập IP công cộng của mạng nhà bạn.') + '\n' +
                    chalk.dim('(Nhấn Ctrl+C để đóng Tunnel và kết thúc phiên)'),
                    { padding: 1, borderColor: 'cyan', borderStyle: 'round' }
                ));
                
                console.log(chalk.bold.magenta('\n📱 Quét mã QR dưới đây bằng điện thoại để xem trực tiếp:\n'));
                qrcode.generate(tunnel.url, { small: true });

                console.log(chalk.bold.cyan('\n📡 Live Traffic Log:'));
                console.log(chalk.dim('Đang chờ request...'));
            } else {
                console.log(chalk.green(`✅ Đã khôi phục kết nối tại: ${tunnel.url}`));
            }

            retryCount = 0; // Reset retry count on successful connection

            tunnel.on('request', (info) => {
                sessionStats.total++;
                sessionStats.methods[info.method] = (sessionStats.methods[info.method] || 0) + 1;

                const time = new Date().toLocaleTimeString();
                let methodColor = chalk.white;
                if (info.method === 'GET') methodColor = chalk.green;
                else if (info.method === 'POST') methodColor = chalk.yellow;
                else if (info.method === 'PUT') methodColor = chalk.blue;
                else if (info.method === 'DELETE') methodColor = chalk.red;
                else methodColor = chalk.magenta;
                
                console.log(chalk.gray(`[${time}]`) + ' ' + methodColor.bold(`[${info.method}]`) + ' ' + chalk.white(info.path));
            });

            // Block event loop until tunnel is closed
            await new Promise((resolve) => {
                tunnel.on('close', () => {
                    currentTunnel = null;
                    resolve();
                });
                tunnel.on('error', (err) => {
                    console.log(chalk.red(`\nLỗi Tunnel: ${err.message}`));
                    tunnel.close();
                });
            });

            if (!isIntentionalClose) {
                console.log(chalk.yellow('\n⚠️ Tunnel bị ngắt kết nối đột ngột!'));
                retryCount++;
                if (retryCount <= MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, 3000));
                }
            } else {
                console.log(chalk.red('\n🛑 Tunnel đã đóng. Ngắt kết nối thành công.'));
            }

        } catch (err) {
            if (tunnelSpinner.isSpinning) tunnelSpinner.fail(chalk.red('Lỗi tạo Tunnel: ' + err.message));
            else console.log(chalk.red('\nLỗi: ' + err.message));
            
            if (!isIntentionalClose) {
                retryCount++;
                if (retryCount <= MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, 3000));
                } else {
                    await waitToReturn();
                }
            }
        }
    }
    
    process.removeListener('SIGINT', onSigint);
}

async function waitToReturn() {
    await inquirer.prompt([{
        type: 'input', name: 'continue',
        message: 'Nhấn [Enter] để quay lại Menu chính...'
    }]);
}

async function main() {
    updateNotifier({pkg}).notify();

    program
        .option('-p, --port <number>', 'Port cần mở', parseInt)
        .option('-s, --subdomain <string>', 'Subdomain mong muốn')
        .option('--host <url>', 'Sử dụng Custom Localtunnel Host');

    program.parse(process.argv);
    const options = program.opts();

    if (options.port) {
        await tempPort(options.port, options.subdomain || '', options.host || '');
        return;
    }

    while (true) {
        showHeader();
        const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'Chọn hành động:',
            choices: [
                { name: '🚀  Bật Tunnel (Start Port Forwarding)', value: 'port' },
                new inquirer.Separator(),
                { name: '🚪  Thoát', value: 'exit' }
            ]
        }]);

        if (action === 'exit') {
            console.log(chalk.cyan('\n  👋 Tạm biệt!\n'));
            process.exit(0);
        } else if (action === 'port') {
            await tempPort();
        }
    }
}

main().catch(err => {
    console.error(chalk.red('\nLỗi: ' + err.message));
});
