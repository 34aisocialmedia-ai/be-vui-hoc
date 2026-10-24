param(
  [string]$ManifestPath = "$PSScriptRoot/../review/cover-assets.json",
  [string]$OutputDirectory = "$PSScriptRoot/../public/assets/covers",
  [string]$FileSuffix = '.jpg'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$coverOutput = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $coverOutput -Force | Out-Null
$jpegCodec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$encoderOptions = [Drawing.Imaging.EncoderParameters]::new(1)
$encoderOptions.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality, [long]85)
try {
  foreach ($coverEntry in (Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json)) {
    if ($coverEntry.id -notmatch '^[a-z]+(?:[-_][a-z]+)*$') { throw 'Invalid cover name' }
    $coverImage = [Drawing.Image]::FromFile($coverEntry.source)
    try { $coverImage.Save((Join-Path $coverOutput ($coverEntry.id + $FileSuffix)), $jpegCodec, $encoderOptions) }
    finally { $coverImage.Dispose() }
  }
} finally { $encoderOptions.Dispose() }
Get-ChildItem -LiteralPath $coverOutput | Select-Object Name, Length
