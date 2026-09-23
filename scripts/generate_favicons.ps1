Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$sourcePath,
        [string]$destPath,
        [int]$width,
        [int]$height
    )
    $src = [System.Drawing.Bitmap]::FromFile($sourcePath)
    $dest = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($dest)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($src, 0, 0, $width, $height)
    $graphics.Dispose()
    $src.Dispose()
    $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
}

$logo = Resolve-Path "src/logos/logo ITID 3.png"
Resize-Image $logo "public/favicon-32x32.png" 32 32
Resize-Image $logo "public/favicon-48x48.png" 48 48
Resize-Image $logo "public/favicon-96x96.png" 96 96
Resize-Image $logo "public/favicon-192x192.png" 192 192
Resize-Image $logo "public/favicon-512x512.png" 512 512
Resize-Image $logo "public/apple-touch-icon.png" 180 180
Resize-Image $logo "public/logo-itid.png" 512 512

# Convert 48x48 to .ico
$icoSrc = [System.Drawing.Bitmap]::FromFile((Resolve-Path "public/favicon-48x48.png"))
$iconHandle = $icoSrc.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($iconHandle)
$stream = New-Object System.IO.FileStream ("public/favicon.ico"), ([System.IO.FileMode]::Create)
$icon.Save($stream)
$stream.Close()
$icoSrc.Dispose()

Write-Output "Favicons successfully generated!"
