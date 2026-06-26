#!/usr/bin/env node
const inquirer = require('inquirer');
const chalk = require('chalk');
const boxen = require('boxen');
const gradient = require('gradient-string');
const figlet = require('figlet');
const ora = require('ora');
const localtunnel = require('localtunnel');
const { execSync } = require('child_process');
const qrcode = require('qrcode-terminal');
const net = require('net');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '.temp-port-config.json');

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
        execSync('clip', { input: text });
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

async function tempPort() {
    console.log(chalk.yellow('\n🌐 Bắt đầu khởi tạo Đường hầm Internet...'));
    const config = loadConfig();
    
    // Auto-scan ports
    const scanSpinner = ora('Đang tự động dò tìm các Server đang chạy...').start();
    const activePorts = await scanActiveDevPorts();
    scanSpinner.stop();

    let selectedPort = null;

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

    saveConfig({ port: selectedPort, subdomain: subdomain.trim() });
    const port = selectedPort;

    const tunnelSpinner = ora('Đang xuyên thủng đường hầm (Tunnel)...').start();
    let tunnel;
    try {
        const tunnelOptions = { port: port };
        if (subdomain.trim() !== '') {
            tunnelOptions.subdomain = subdomain.trim();
        }
        
        tunnel = await localtunnel(tunnelOptions);
        tunnelSpinner.succeed(chalk.green('Tunnel đã mở thành công!'));

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

        // Block event loop until tunnel is closed or user interrupts
        await new Promise((resolve) => {
            tunnel.on('close', () => {
                console.log(chalk.red('\n🛑 Tunnel đã đóng. Ngắt kết nối thành công.'));
                resolve();
            });
            
            // Intercept Ctrl+C
            const onSigint = () => {
                tunnel.close();
                process.removeListener('SIGINT', onSigint);
            };
            process.on('SIGINT', onSigint);
        });

    } catch (err) {
        if (tunnelSpinner.isSpinning) tunnelSpinner.fail(chalk.red('Lỗi tạo Tunnel: ' + err.message));
        else console.log(chalk.red('\nLỗi: ' + err.message));
        await waitToReturn();
    }
}

async function waitToReturn() {
    await inquirer.prompt([{
        type: 'input', name: 'continue',
        message: 'Nhấn [Enter] để quay lại Menu chính...'
    }]);
}

async function main() {
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
