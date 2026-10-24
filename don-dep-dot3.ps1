# Đợt 3 – dọn thư mục dự án và bắt đầu dùng Git.
# Script chỉ DI CHUYỂN, không xóa file nào. Mọi thứ được chuyển vào "C:\app student\_luu-tru".
#
# Chạy thử (chỉ in ra việc sẽ làm, không thay đổi gì):
#   powershell -ExecutionPolicy Bypass -File .\don-dep-dot3.ps1 -ThuTruoc
# Chạy thật:
#   powershell -ExecutionPolicy Bypass -File .\don-dep-dot3.ps1

param([switch]$ThuTruoc)
$ErrorActionPreference = 'Stop'
$App = $PSScriptRoot
$Store = Join-Path (Split-Path $App -Parent) '_luu-tru'
$Backup = Join-Path $App 'backup-truoc-toi-uu-dot3-20261021'

function Move-Safely([string]$From, [string]$To) {
  if (-not (Test-Path -LiteralPath $From)) { return }
  if (Test-Path -LiteralPath $To) { $To = "$To-$(Get-Date -Format 'HHmmss')" }
  Write-Host ("  {0}`n    -> {1}" -f $From, $To)
  if ($ThuTruoc) { return }
  $parent = Split-Path $To -Parent
  if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  Move-Item -LiteralPath $From -Destination $To
}

if ($ThuTruoc) { Write-Host "CHẠY THỬ – không có gì bị thay đổi.`n" -ForegroundColor Yellow }

Write-Host "1. Ảnh PNG/JPG gốc (game đã dùng bản .webp) -> _luu-tru\anh-goc" -ForegroundColor Cyan
foreach ($dir in 'images', 'objects', 'covers', 'photos') {
  $src = Join-Path $App "public\assets\$dir"
  Get-ChildItem -LiteralPath $src -File | Where-Object { $_.Extension -in '.png', '.jpg', '.jpeg' } | ForEach-Object {
    $webp = [IO.Path]::ChangeExtension($_.FullName, '.webp')
    if (Test-Path -LiteralPath $webp) { Move-Safely $_.FullName (Join-Path $Store "anh-goc\$dir\$($_.Name)") }
    else { Write-Host "  GIỮ LẠI $($_.Name): chưa có bản .webp" -ForegroundColor Yellow }
  }
}

Write-Host "2. 9 file CSS cũ (đã gộp vào src\app.css) -> backup-truoc-toi-uu-dot3-20261021" -ForegroundColor Cyan
foreach ($css in 'studio\studio.css', 'styles.css', 'kid-ui.css', 'game-covers.css', 'learning-updates.css', 'curriculum.css', 'app-design.css', 'adventures.css', 'mobile.css') {
  Move-Safely (Join-Path $App "src\$css") (Join-Path $Backup "src\$css")
}

Write-Host "3. Script đời đầu ở thư mục gốc -> scripts\cu (chạy từ thư mục app như trước)" -ForegroundColor Cyan
foreach ($f in 'add_greetings.py', 'download_3d_emojis.py', 'download_real_photos.py', 'extract_texts.mjs', 'generate_audio_packs.py', 'generate_learning_audio.py', 'generate_new_engine_audio.py', 'remove_bg.py') {
  Move-Safely (Join-Path $App $f) (Join-Path $App "scripts\cu\$f")
}

Write-Host "4. Bản sao cũ không còn dùng -> _luu-tru" -ForegroundColor Cyan
Move-Safely (Join-Path $App 'source-before-ux-review.zip') (Join-Path $Store 'source-before-ux-review.zip')
Move-Safely (Join-Path $App 'review\vosk-model-small-vn-0.4.zip') (Join-Path $Store 'vosk-model-small-vn-0.4.zip')
Move-Safely (Join-Path $App 'review\legacy-audio') (Join-Path $Store 'legacy-audio')
Move-Safely (Join-Path $App 'review\co-thuy-batch3-suspect.mp3') (Join-Path $Store 'co-thuy-batch3-suspect.mp3')
foreach ($r in 'release-co-thuy-20261013', 'release-co-thuy-20261013-v2') {
  Move-Safely (Join-Path (Split-Path $App -Parent) $r) (Join-Path $Store $r)
}

Write-Host "5. Git" -ForegroundColor Cyan
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "  Máy chưa cài Git. Cài từ https://git-scm.com/download/win rồi chạy lại script này." -ForegroundColor Yellow
} elseif (Test-Path -LiteralPath (Join-Path $App '.git')) {
  Write-Host "  Dự án đã có Git, bỏ qua bước khởi tạo."
} elseif (-not $ThuTruoc) {
  Push-Location $App
  try {
    git init | Out-Null
    git symbolic-ref HEAD refs/heads/main
    if (-not (git config user.name)) { git config user.name 'Bé Vui Học' }
    if (-not (git config user.email)) { git config user.email 'mkt@meovideoai.com' }
    git add -A
    git commit -q -m "Bé Vui Học: mã nguồn sau tối ưu đợt 1–3 (21/10/2026)"
    Write-Host ("  Đã tạo kho Git với {0} file." -f (git ls-files | Measure-Object).Count)
  } finally { Pop-Location }
} else {
  Write-Host "  Sẽ chạy: git init, git add -A, git commit"
}

Write-Host "`nXong. Kiểm tra lại: npm test, rồi npm run build." -ForegroundColor Green
