#!/bin/bash
PORT=8080
DIST_DIR="$(cd "$(dirname "$0")/dist" && pwd)"

# 检查端口是否被占用，换一个
while lsof -ti:$PORT &>/dev/null; do
  PORT=$((PORT + 1))
done

echo "启动 LF2 游戏服务器，端口: $PORT"
python3 -m http.server $PORT --directory "$DIST_DIR" &
SERVER_PID=$!

sleep 0.5
open "http://localhost:$PORT"

echo "游戏已在浏览器中打开（http://localhost:$PORT）"
echo "按 Ctrl+C 停止服务器"

trap "kill $SERVER_PID 2>/dev/null; echo '服务器已停止'" EXIT
wait $SERVER_PID
