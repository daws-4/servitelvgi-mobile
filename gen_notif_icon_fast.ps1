Add-Type -AssemblyName System.Drawing

$inputFile = "assets\logo_bgless.png"
$outputFile = "assets\notification_icon_white.png"
$targetSize = 96

if (!(Test-Path $inputFile)) {
    Write-Error "Input file not found: $inputFile"
    exit 1
}

Write-Host "Processing $inputFile..."

try {
    $image = [System.Drawing.Image]::FromFile((Convert-Path $inputFile))
    
    # Create a destination bitmap
    $newBitmap = new-object System.Drawing.Bitmap $targetSize, $targetSize
    $graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Color Matrix to make pixels White while preserving Alpha
    # R G B A W
    $matrixItems = @(
        @(0, 0, 0, 0, 0),   # Scale R
        @(0, 0, 0, 0, 0),   # Scale G
        @(0, 0, 0, 0, 0),   # Scale B
        @(0, 0, 0, 1, 0),   # Scale A
        @(1, 1, 1, 0, 1)    # Translations (Add 1.0 to R, G, B) -> White
    )

    $imgAttributes = new-object System.Drawing.Imaging.ImageAttributes
    $colorMatrix = new-object System.Drawing.Imaging.ColorMatrix(,$matrixItems) 
    # Note: PowerShell array of arrays needs weird syntax or flat array? 
    # Actually, simpler constructor takes a jagged array in C#, but in PS let's be careful.
    # The matrix is 5x5.
    
    # Flattened array approach is safer in some PS versions or just create the object and set properties?
    # No, strictly strictly ColorMatrix constructor takes a 2D array.
    # Let's try the jagged array syntax which usually works.
    
    $imgAttributes.SetColorMatrix($colorMatrix)

    # Draw the image resized and recolored
    $graphics.DrawImage($image, 
        [System.Drawing.Rectangle]::new(0, 0, $targetSize, $targetSize),
        0, 0, $image.Width, $image.Height,
        [System.Drawing.GraphicsUnit]::Pixel,
        $imgAttributes)
    
    $newBitmap.Save((Join-Path (Get-Location) $outputFile), [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $newBitmap.Dispose()
    $image.Dispose()

    Write-Host "Generated $outputFile ($targetSize x $targetSize)"
} catch {
    Write-Error "Failed to generate icon: $_"
}
