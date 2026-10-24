@echo off
rem Dua ban moi nhat len link dev cu: https://be-vui-hoc-test.pages.dev
cd /d "%~dp0"
echo [1/4] Kiem tra (npm test)...
call npm test || call node --import ./tests/register.mjs --test --experimental-test-isolation=none tests/*.test.mjs || goto :fail
echo [2/4] Dong goi (npm run build)...
call npm run build || goto :fail
echo [3/4] Chuan bi kho luu khoa API cho Xuong sang tao...
call node scripts\chuan-bi-kho-khoa.mjs
echo [4/4] Dua len Cloudflare Pages (be-vui-hoc-test)...
call npx --yes wrangler@4 pages deploy dist --project-name be-vui-hoc-test || goto :fail
echo.
echo Xong. Mo https://be-vui-hoc-test.pages.dev (hoac link wrangler in o tren) de xem.
pause
exit /b 0
:fail
echo.
echo Co loi, CHUA dua len. Xem thong bao o tren.
pause
exit /b 1
