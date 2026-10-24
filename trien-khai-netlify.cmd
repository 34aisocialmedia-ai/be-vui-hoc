@echo off
rem Dua Be Vui Hoc len NETLIFY (ca trang web va may chu nho cho Xuong sang tao 34AI).
rem Lan dau: dang nhap Netlify (trinh duyet tu mo), tao trang moi, dan khoa 34AI mac dinh mot lan.
cd /d "%~dp0"
echo [1/4] Cai thu vien (npm install)...
call npm install --no-audit --no-fund || goto :fail
echo [2/4] Kiem tra (npm test)...
call npm test || call node --import ./tests/register.mjs --test --experimental-test-isolation=none tests/*.test.mjs || goto :fail
echo [3/4] Chuan bi trang Netlify va khoa 34AI mac dinh...
call node scripts\chuan-bi-netlify.mjs || goto :fail
echo [4/4] Dong goi va dua len Netlify...
call npx --yes netlify-cli@27 deploy --prod || goto :fail
echo.
echo Xong. Link trang nam o dong "Production URL" / "Deployed to production URL" phia tren.
pause
exit /b 0
:fail
echo.
echo Co loi, CHUA dua len. Xem thong bao o tren.
pause
exit /b 1
