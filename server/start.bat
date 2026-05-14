@echo off
cd /d %~dp0
taskkill /im httpd.exe /f /t
start bin\httpd.exe
echo Waiting for http server started
timeout 10 /nobreak
start chrome http://localhost:9488/
exit
