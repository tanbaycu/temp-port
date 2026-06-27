# 🌐 Temp Port

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node->=14.0.0-brightgreen.svg)

> Đưa Localhost của bạn ra toàn cầu (Internet) chỉ trong 1 giây! Giải pháp thay thế ngrok hoàn hảo với Auto-scan, Custom Subdomain, Live Traffic Log và Mã QR thần tốc.

---

## ✨ Tính năng nổi bật (Peak Features)

- **🔍 Auto-Scan Thông Minh**: Tự động dò tìm các cổng Developer phổ biến đang chạy trên máy và đưa ra gợi ý. Không cần gõ tay!
- **🏷️ Custom Subdomain & Host**: Tự do chọn tên miền phụ mang thương hiệu của bạn (Ví dụ: `https://tanbaycu-app.loca.lt`). Hỗ trợ cấu hình cả Custom Host (`--host`) nếu bạn có server riêng.
- **📱 QR Code Tích Hợp**: Sinh ngay một mã QR Code trực quan ngay trên Terminal.
- **📋 Copy Clipboard Đa Nền Tảng**: Tự động copy URL Public vào clipboard, hoạt động mượt mà trên cả Windows, macOS và Linux.
- **📡 Live Traffic Log & Dashboard**: Bắt và in ra các request HTTP theo thời gian thực. Khi kết thúc phiên (Ctrl+C), xuất báo cáo tổng kết chi tiết (Uptime & Số lượng Request).
- **🛡️ Auto-Reconnect**: Khả năng tự động kết nối lại mạnh mẽ khi rớt mạng hoặc sập tunnel. Không lo đứt kết nối!
- **🛎️ Update Notifier**: Tự động nhắc nhở cập nhật mỗi khi có phiên bản mới trên NPM.

## 🚀 Cài đặt

Yêu cầu máy tính đã cài đặt **Node.js**.

```bash
# Cài đặt qua npm (Global)
npm install -g temp-port

# Hoặc Clone mã nguồn về máy:
git clone https://github.com/tanbaycu/temp-port.git
cd temp-port
npm install
```

## 🎮 Cách sử dụng

### 1. Dùng Menu Tương Tác (Interactive Mode)
Chỉ cần chạy lệnh sau, giao diện (CLI) sẽ hướng dẫn bạn từng bước:
```bash
temp-port
# Hoặc nếu chưa cài đặt global: node temp-port.js
```

### 2. Dùng Tham số dòng lệnh (Bypass Menu)
Mở tunnel ngay lập tức mà không cần trải qua các bước hỏi đáp:
```bash
temp-port --port 3000 --subdomain my-awesome-app
```

**Các tham số hỗ trợ:**
- `-p, --port <number>`: Cổng localhost cần mở (Ví dụ: 3000, 5173).
- `-s, --subdomain <string>`: Subdomain mong muốn (Ví dụ: `tanbaycu-test`).
- `--host <url>`: Trỏ tới máy chủ Localtunnel tuỳ chỉnh (Nếu bạn tự host server).

## 🛠️ Công nghệ sử dụng
- [Localtunnel](https://github.com/localtunnel/localtunnel) - Core mở Port.
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) / [Commander.js](https://github.com/tj/commander.js) - Xây dựng giao diện CLI.
- [Chalk](https://github.com/chalk/chalk) / [Boxen](https://github.com/sindresorhus/boxen) - Trang trí giao diện Terminal.
- [Clipboardy](https://github.com/sindresorhus/clipboardy) - Xử lý Clipboard.

## 💡 Tác giả
- Phát triển bởi **[tanbaycu](https://github.com/tanbaycu)**.
- Đừng quên thả 1 ⭐️ nếu bạn thấy công cụ này hữu ích nhé!
