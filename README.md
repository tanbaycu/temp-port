# 🌐 Temp Port

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node->=14.0.0-brightgreen.svg)

> Đưa Localhost của bạn ra toàn cầu (Internet) chỉ trong 1 giây! Giải pháp thay thế ngrok hoàn hảo với Auto-scan, Custom Subdomain và Mã QR thần tốc.

---

## ✨ Tính năng nổi bật (Peak Features)

- **🔍 Auto-Scan Thông Minh**: Tự động dò tìm các cổng Developer phổ biến (React, Vite, Node, Django...) đang chạy trên máy và đưa ra gợi ý. Không cần gõ tay!
- **🏷️ Custom Subdomain**: Tự do chọn tên miền cực chất mang thương hiệu của bạn (Ví dụ: `https://tanbaycu-app.loca.lt`).
- **📱 QR Code Tích Hợp**: Sinh ngay một mã QR Code trực quan ngay trên Terminal. Giơ điện thoại lên quét để test giao diện Mobile (Responsive) trong nháy mắt.
- **🩺 Khám Sức Khoẻ Localhost (Health Check)**: Hệ thống sẽ "gõ cửa" Port trước khi tạo Tunnel. Nếu Server chưa chạy, một cảnh báo sẽ hiện lên ngay lập tức.
- **🗂️ Lưu Lịch Sử Thông Minh**: Tự động nhớ cấu hình Port và Subdomain ở lần chạy trước. Ở lần kế tiếp, bạn chỉ cần gõ Enter liên tục là xong.

## 🚀 Cài đặt

Yêu cầu máy tính đã cài đặt **Node.js**.

1. Clone Repository này về máy:
   ```bash
   git clone https://github.com/tanbaycu/temp-port.git
   cd temp-port
   ```

2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install inquirer chalk boxen gradient-string figlet ora localtunnel qrcode-terminal
   ```

## 🎮 Cách sử dụng

Chỉ cần chạy một dòng lệnh duy nhất để khởi động công cụ:
```bash
node temp-port.js
```

Sau đó, giao diện tương tác (CLI) sẽ hướng dẫn bạn chọn Port và Subdomain chỉ trong vài giây.

## 📸 Ảnh chụp màn hình
*(Bạn hãy chụp ảnh màn hình Terminal lúc đang chạy công cụ và chèn vào đây nhé!)*

## 🛠️ Công nghệ sử dụng
- [Localtunnel](https://github.com/localtunnel/localtunnel) - Core mở Port.
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) - Xây dựng giao diện tương tác.
- [Chalk](https://github.com/chalk/chalk) & [Gradient-string](https://github.com/bokub/gradient-string) - Đổ màu Terminal.

## 💡 Tác giả
- Phát triển bởi **[tanbaycu](https://github.com/tanbaycu)**.
- Đừng quên thả 1 ⭐️ nếu bạn thấy công cụ này hữu ích nhé!
