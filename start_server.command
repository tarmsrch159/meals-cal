#!/bin/bash
# Script to start Vite development server for Doo-Lae Web App
cd "$(dirname "$0")"

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
  echo "📦 กำลังติดตั้ง dependencies กรุณารอสักครู่..."
  npm install
fi

# Get local IP address
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

echo "========================================================"
echo "   🚀 สตาร์ท Doo-Lae (Vue 3 + Vite) Server"
echo "========================================================"
echo ""
echo " 📱 บนมือถือ (ต่อ Wi-Fi เดียวกัน) เปิดเบราว์เซอร์แล้วเข้า:"
echo "    http://$IP:8080"
echo ""
echo " 💻 บนคอมพิวเตอร์ เข้าที่:"
echo "    http://localhost:8080"
echo ""
echo " (กด Ctrl + C ในหน้าต่างนี้เพื่อปิดเซิร์ฟเวอร์)"
echo "========================================================"
echo ""

npm run dev -- --host 0.0.0.0 --port 8080
