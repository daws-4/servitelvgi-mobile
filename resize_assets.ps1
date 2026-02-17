Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$InputFile,
        [string]$OutputFile,
        [int]$Width,
        [int]$Height,
        [double]$ScaleFactor = 1.0, # 1.0 = fill/fit, 0.6 = 60% size (centered)
        [string]$BackgroundColor = "Transparent" # "Transparent", "White", "Black", etc.
    )

    $fullInputPath = Convert-Path $InputFile
    $fullOutputPath = $OutputFile

    Write-Host "Processing $fullInputPath..."

    try {
        $image = [System.Drawing.Image]::FromFile($fullInputPath)
        
        # Create a blank canvas
        $newImage = new-object System.Drawing.Bitmap $Width, $Height
        $graphics = [System.Drawing.Graphics]::FromImage($newImage)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Set background color
        if ($BackgroundColor -eq "Transparent") {
            $graphics.Clear([System.Drawing.Color]::Transparent)
        } else {
            $color = [System.Drawing.Color]::FromName($BackgroundColor)
            $graphics.Clear($color)
        }

        # Calculate dimensions for the Source Image on the Canvas
        $targetContentWidth = $Width * $ScaleFactor
        $targetContentHeight = $Height * $ScaleFactor

        $ratioX = $targetContentWidth / $image.Width
        $ratioY = $targetContentHeight / $image.Height
        $ratio = [Math]::Min($ratioX, $ratioY)

        $drawWidth = [int]($image.Width * $ratio)
        $drawHeight = [int]($image.Height * $ratio)

        # Center the image
        $x = [int](($Width - $drawWidth) / 2)
        $y = [int](($Height - $drawHeight) / 2)

        $graphics.DrawImage($image, $x, $y, $drawWidth, $drawHeight)
        
        # Determine format based on extension
        $extension = [System.IO.Path]::GetExtension($OutputFile).ToLower()
        $format = [System.Drawing.Imaging.ImageFormat]::Png
        if ($extension -eq ".jpg" -or $extension -eq ".jpeg") {
            $format = [System.Drawing.Imaging.ImageFormat]::Jpeg
        }

        $newImage.Save($OutputFile, $format)

        $graphics.Dispose()
        $newImage.Dispose()
        $image.Dispose()

        Write-Host "Resized to $OutputFile ($Width x $Height) with Scale $ScaleFactor and BG $BackgroundColor"
    } catch {
        Write-Error "Failed to resize $InputFile : $_"
    }
}

# Ensure assets directory exists
if (!(Test-Path "assets")) {
    Write-Error "Assets directory not found!"
    exit 1
}

# Resize Icon (1024x1024)
# ScaleFactor 0.60 ensures the icon content is inside the ~720px safe zone circle
# Using Transparent background for PNG
Resize-Image -InputFile "assets\logo_bgless.png" -OutputFile "assets\logo_bgless_resized.png" -Width 1024 -Height 1024 -ScaleFactor 0.60 -BackgroundColor "Transparent"

# Resize Splash (1080x1920)
# Using WHITE background for JPEG to avoid black borders from transparency
Resize-Image -InputFile "assets\logo_.jpeg" -OutputFile "assets\logo_resized.jpeg" -Width 1080 -Height 1920 -ScaleFactor 1.0 -BackgroundColor "White"
