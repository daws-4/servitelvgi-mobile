Add-Type -AssemblyName System.Drawing

function Optimize-Splash {
    param (
        [string]$InputFile,
        [string]$OutputFile,
        [int]$WhiteThreshold = 252, # Very strict (0-255), almost pure white
        [int]$Shave = 5, # Pixels to REMOVE from the DETECTED logo edges (inward crop) to kill artifacts
        [int]$Padding = 40 # Pixels of PURE WHITE to add around the result
    )

    $fullInputPath = Convert-Path $InputFile
    $fullOutputPath = $OutputFile

    Write-Host "Processing $fullInputPath..."

    try {
        $image = [System.Drawing.Image]::FromFile($fullInputPath)
        $bitmap = new-object System.Drawing.Bitmap $image

        # 1. Find tight bounds of non-white content
        $minX = $bitmap.Width
        $minY = $bitmap.Height
        $maxX = 0
        $maxY = 0

        # Scan
        $step = 5
        for ($x = 0; $x -lt $bitmap.Width; $x += $step) {
            for ($y = 0; $y -lt $bitmap.Height; $y += $step) {
                $pixel = $bitmap.GetPixel($x, $y)
                
                # Check if pixel is NOT white (using threshold)
                $isWhite = ($pixel.R -ge $WhiteThreshold) -and ($pixel.G -ge $WhiteThreshold) -and ($pixel.B -ge $WhiteThreshold)
                
                if (-not $isWhite) {
                    if ($x -lt $minX) { $minX = $x }
                    if ($x -gt $maxX) { $maxX = $x }
                    if ($y -lt $minY) { $minY = $y }
                    if ($y -gt $maxY) { $maxY = $y }
                }
            }
        }
        
        # 2. Apply INWARD cropping (Shave) to remove edge artifacts
        $minX = $minX + $Shave
        $minY = $minY + $Shave
        $maxX = $maxX - $Shave
        $maxY = $maxY - $Shave
        
        $cropWidth = $maxX - $minX
        $cropHeight = $maxY - $minY
        
        if ($cropWidth -le 0 -or $cropHeight -le 0) {
            Write-Error "Could not find content to crop (image might be empty or fully white after shaving)"
            return
        }

        Write-Host "Tight Content: $minX, $minY ($cropWidth x $cropHeight)"

        # 3. Create the destination canvas with PURE WHITE background + Padding
        # Final size = Crop + 2*Padding
        $finalWidth = $cropWidth + ($Padding * 2)
        $finalHeight = $cropHeight + ($Padding * 2)
        
        # Resize logic if too big (max 1024)
        $maxDim = 1024
        if ($finalWidth -gt $maxDim -or $finalHeight -gt $maxDim) {
             $scale = [Math]::Min($maxDim / $finalWidth, $maxDim / $finalHeight)
             $finalWidth = [int]($finalWidth * $scale)
             $finalHeight = [int]($finalHeight * $scale)
             
             # Adjust crop size for drawing
             $drawWidth = [int]($cropWidth * $scale)
             $drawHeight = [int]($cropHeight * $scale)
             
             $paddingX = [int](($finalWidth - $drawWidth) / 2)
             $paddingY = [int](($finalHeight - $drawHeight) / 2)
        } else {
             $drawWidth = $cropWidth
             $drawHeight = $cropHeight
             $paddingX = $Padding
             $paddingY = $Padding
        }

        $finalBitmap = new-object System.Drawing.Bitmap $finalWidth, $finalHeight
        $graphics = [System.Drawing.Graphics]::FromImage($finalBitmap)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        
        # Fill with PURE WHITE
        $graphics.Clear([System.Drawing.Color]::White)
        
        # Draw the cropped content centered
        $sourceRect = [System.Drawing.Rectangle]::new($minX, $minY, $cropWidth, $cropHeight)
        $destRect = [System.Drawing.Rectangle]::new($paddingX, $paddingY, $drawWidth, $drawHeight)
        
        $graphics.DrawImage($bitmap, $destRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
        
        $finalBitmap.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $graphics.Dispose()
        $finalBitmap.Dispose()
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

# Run the optimization with aggressive artifact removal
Optimize-Splash -InputFile "assets\logo_.jpeg" -OutputFile "assets\splash_optimized.png" -WhiteThreshold 250 -Shave 15 -Padding 50
