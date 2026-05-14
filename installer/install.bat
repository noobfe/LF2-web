@echo off

SET NEWLINE=^& echo.

cd /d %~dp0
echo Installing Microsoft Visual C++ 2015 Redistributable...
start /wait vc_redist.2015.x86.exe /install /passive /norestart

rem echo Installing Google Chrome...
rem start /wait GoogleChromeStandaloneEnterprise.msi /quiet /passive /norestart

echo Setting HOSTS files
FIND /C /I "localhost" %WINDIR%\system32\drivers\etc\hosts

exit
