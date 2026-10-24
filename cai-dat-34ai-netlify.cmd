@echo off
rem Dat hoac doi KHOA 34AI MAC DINH cua app tren Netlify (bien AI34_API_KEY).
rem Moi thiet bi dung khoa nay, tru khi phu huynh dan khoa rieng trong Xuong sang tao.
cd /d "%~dp0"
call node scripts\dat-khoa-34ai.mjs netlify || goto :fail
echo.
echo Dang dua len lai de khoa moi co hieu luc...
call npx --yes netlify-cli@27 deploy --prod || goto :fail
echo Xong. Mo Xuong sang tao va bam "Thu ket noi".
pause
exit /b 0
:fail
echo Co loi, xem thong bao o tren.
pause
exit /b 1
