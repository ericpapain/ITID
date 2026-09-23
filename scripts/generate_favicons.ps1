Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile((Resolve-Path "src/logos/logo ITID 3.png"))

# Outer ring diameter is ~1190. Center is (621, 625)
# Crop tightly so the double teal ring touches the 4 edges of the square
$size = 1190
$cropX = [int](621 - ($size / 2))
$cropY = [int](625 - ($size / 2))

$dest = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($dest)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)

# Clip to circular path so outer corners are transparent and the circle fills 100%
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(0, 0, $size, $size)
$g.SetClip($path)

$srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $size, $size
$destRect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
$g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$path.Dispose()

function Export-Icon ($bitmap, $outPath, $w, $h) {
    $outBmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g2 = [System.Drawing.Graphics]::FromImage($outBmp)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g2.Clear([System.Drawing.Color]::Transparent)
    $g2.DrawImage($bitmap, 0, 0, $w, $h)
    $g2.Dispose()
    $outBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
}

# Generate all favicon sizes
Export-Icon $dest "public/favicon-32x32.png" 32 32
Export-Icon $dest "public/favicon-48x48.png" 48 48
Export-Icon $dest "public/favicon-96x96.png" 96 96
Export-Icon $dest "public/favicon-192x192.png" 192 192
Export-Icon $dest "public/favicon-512x512.png" 512 512
Export-Icon $dest "public/apple-touch-icon.png" 180 180
Export-Icon $dest "public/logo-itid.png" 512 512

# Convert 48x48 to .ico
$icoSrc = [System.Drawing.Bitmap]::FromFile((Resolve-Path "public/favicon-48x48.png"))
$iconHandle = $icoSrc.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($iconHandle)
$stream = New-Object System.IO.FileStream ("public/favicon.ico"), ([System.IO.FileMode]::Create)
$icon.Save($stream)
$stream.Close()
$icoSrc.Dispose()

$dest.Dispose()
$src.Dispose()

Write-Output "Favicons successfully generated edge-to-edge!"
