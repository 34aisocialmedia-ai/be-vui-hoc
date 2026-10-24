@echo off
rem Dat hoac doi KHOA 34AI MAC DINH cua app (bien bi mat AI34_API_KEY tren Cloudflare Pages).
rem Moi thiet bi dung khoa nay, tru khi phu huynh dan khoa rieng trong Xuong sang tao.
cd /d "%~dp0"
call node scripts\dat-khoa-34ai.mjs || goto :fail
echo.
echo Xong. Mo lai Xuong sang tao va bam "Thu ket noi".
pause
exit /b 0
:fail
echo Co loi, xem thong bao o tren.
pause
exit /b 1
