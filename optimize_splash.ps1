Add-Type -AssemblyName System.Drawing

function Crop-Image {
    param (
        [string]$InputFile,
        [string]$OutputFile,
        [int]$Padding = 20,
        [int]$WhiteThreshold = 250 # 0-255, pixels above this in all channels are considered "white" background
    )

    $fullInputPath = Convert-Path $InputFile
    $fullOutputPath = $OutputFile

    Write-Host "Processing $fullInputPath..."

    try {
        $image = [System.Drawing.Image]::FromFile($fullInputPath)
        $bitmap = new-object System.Drawing.Bitmap $image

        # Find bounds of non-white pixels
        $minX = $bitmap.Width
        $minY = $bitmap.Height
        $maxX = 0
        $maxY = 0

        # Scan specifically around the center or scan everything?
        $step = 5
        for ($x = 0; $x -lt $bitmap.Width; $x += $step) {
            for ($y = 0; $y -lt $bitmap.Height; $y += $step) {
                $pixel = $bitmap.GetPixel($x, $y)
                
                # Check if pixel is NOT white (or close to white)
                $isWhite = ($pixel.R -ge $WhiteThreshold) -and ($pixel.G -ge $WhiteThreshold) -and ($pixel.B -ge $WhiteThreshold)
                
                if (-not $isWhite) {
                    if ($x -lt $minX) { $minX = $x }
                    if ($x -gt $maxX) { $maxX = $x }
                    if ($y -lt $minY) { $minY = $y }
                    if ($y -gt $maxY) { $maxY = $y }
                }
            }
        }
        
        # Adjust bounds with padding
        $minX = [Math]::Max(0, $minX - $Padding)
        $minY = [Math]::Max(0, $minY - $Padding)
        $maxX = [Math]::Min($bitmap.Width - 1, $maxX + $Padding)
        $maxY = [Math]::Min($bitmap.Height - 1, $maxY + $Padding)
        
        $cropWidth = $maxX - $minX
        $cropHeight = $maxY - $minY
        
        if ($cropWidth -le 0 -or $cropHeight -le 0) {
            Write-Error "Could not find content to crop (image might be empty or fully white)"
            return
        }

        Write-Host "Cropping to: $minX, $minY ($cropWidth x $cropHeight)"

        $croppedBitmap = new-object System.Drawing.Bitmap $cropWidth, $cropHeight
        $graphics = [System.Drawing.Graphics]::FromImage($croppedBitmap)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        
        $sourceRect = [System.Drawing.Rectangle]::new($minX, $minY, $cropWidth, $cropHeight)
        $destRect = [System.Drawing.Rectangle]::new(0, 0, $cropWidth, $cropHeight)
        
        $graphics.DrawImage($bitmap, $destRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
        
        # Resize final output to reasonable max size (e.g. 1024 width/height max)
        $maxDim = 1024
        
        $finalWidth = $cropWidth
        $finalHeight = $cropHeight
        
        if ($cropWidth -gt $maxDim -or $cropHeight -gt $maxDim) {
            $ratio = [Math]::Min($maxDim / $cropWidth, $maxDim / $cropHeight)
            $finalWidth = [int]($cropWidth * $ratio)
            $finalHeight = [int]($cropHeight * $ratio)
        }
        
        $finalBitmap = new-object System.Drawing.Bitmap $finalWidth, $finalHeight
        $finalGraphics = [System.Drawing.Graphics]::FromImage($finalBitmap)
        $finalGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $finalGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        
        $finalGraphics.DrawImage($croppedBitmap, 0, 0, $finalWidth, $finalHeight)
        
        $finalBitmap.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $finalGraphics.Dispose()
        $finalBitmap.Dispose()
        $graphics.Dispose()
        $croppedBitmap.Dispose()
        $bitmap.Dispose()
        $image.Dispose()

        Write-Host "Generated optimized splash: $OutputFile ($finalWidth x $finalHeight)"

    } catch {
        Write-Error "Failed to process image: $_"
    }
}

# Ensure assets directory exists
if (!(Test-Path "assets")) {
    Write-Error "Assets directory not found!"
    exit 1
}

# Crop and Resize based on user's preferred source file
Crop-Image -InputFile "assets\logo_.jpeg" -OutputFile "assets\splash_optimized.png"
