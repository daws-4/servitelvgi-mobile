Add-Type -AssemblyName System.Drawing

$inputFile = "assets\logo_bgless.png"
$outputFile = "assets\notification_icon_white.png"

if (!(Test-Path $inputFile)) {
    Write-Error "Input file not found: $inputFile"
    exit 1
}

Write-Host "Processing $inputFile..."

try {
    $image = [System.Drawing.Image]::FromFile((Convert-Path $inputFile))
    $bitmap = new-object System.Drawing.Bitmap $image

    $newBitmap = new-object System.Drawing.Bitmap $bitmap.Width, $bitmap.Height
    
    # Process pixels to make them white while preserving alpha
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
        for ($y = 0; $y -lt $bitmap.Height; $y++) {
            $pixel = $bitmap.GetPixel($x, $y)
            if ($pixel.A -gt 0) {
                # Set to White with original Alpha
                $newColor = [System.Drawing.Color]::FromArgb($pixel.A, 255, 255, 255)
                $newBitmap.SetPixel($x, $y, $newColor)
            } else {
                $newBitmap.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            }
        }
    }

    # Resize to standard notification icon size (e.g. 96x96 is usually enough for xxhdpi, but let's go 144x144 for safety or just keep it reasonably small)
    # Actually, let's resize it to 96x96 to save space and processing, as notification icons are small.
    
    $targetSize = 96
    $resizedBitmap = new-object System.Drawing.Bitmap $targetSize, $targetSize
    $graphics = [System.Drawing.Graphics]::FromImage($resizedBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($newBitmap, 0, 0, $targetSize, $targetSize)
    
    $resizedBitmap.Save((Join-Path (Get-Location) $outputFile), [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $resizedBitmap.Dispose()
    $newBitmap.Dispose()
    $bitmap.Dispose()
    $image.Dispose()

    Write-Host "Generated $outputFile"
} catch {
    Write-Error "Failed to generate icon: $_"
}
