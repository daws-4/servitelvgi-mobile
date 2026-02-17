Add-Type -AssemblyName System.Drawing

$file = "assets\notification-icon.png"
if (!(Test-Path $file)) {
    Write-Error "File not found: $file"
    exit 1
}

$image = [System.Drawing.Image]::FromFile((Convert-Path $file))
$bitmap = new-object System.Drawing.Bitmap $image

$hasColor = $false
$hastransparency = $false

for ($x = 0; $x -lt $bitmap.Width; $x += 10) {
    for ($y = 0; $y -lt $bitmap.Height; $y += 10) {
        $pixel = $bitmap.GetPixel($x, $y)
        if ($pixel.A -lt 255) { $hastransparency = $true }
        if ($pixel.A -gt 0) {
            # Check if pixel has color (R != G or G != B)
            if ($pixel.R -ne $pixel.G -or $pixel.G -ne $pixel.B) {
                $hasColor = $true
            }
        }
    }
}

Write-Host "Has Transparency: $hastransparency"
Write-Host "Has Color: $hasColor"
Write-Host "Dimensions: $($bitmap.Width)x$($bitmap.Height)"

$image.Dispose()
