
# Load System.Drawing assembly
Add-Type -AssemblyName System.Drawing

# Paths
$sourcePath = "c:\Users\andre\Desktop\La-Chintana-App\client\public\logo_chintana_fenix.png"
$destPath192 = "c:\Users\andre\Desktop\La-Chintana-App\client\public\logo192.png"
$destPath512 = "c:\Users\andre\Desktop\La-Chintana-App\client\public\logo512.png"

# Check if source exists
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source file not found: $sourcePath"
    exit 1
}

# Function to resize and save image with padding
function Resize-ImageWithPadding {
    param (
        [string]$SourceFile,
        [string]$DestFile,
        [int]$TargetSize,
        [float]$ScaleFactor = 0.9,
        [string]$HexColor = "#002e5c"
    )

    $sourceImage = [System.Drawing.Image]::FromFile($SourceFile)
    
    # Create a new bitmap with background color
    $bitmap = New-Object System.Drawing.Bitmap($TargetSize, $TargetSize)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Parse hex color
    $colorConverter = New-Object System.Drawing.ColorConverter
    $bgColor = $colorConverter.ConvertFromString($HexColor)
    
    $graphics.Clear($bgColor)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Calculate dimensions to fit within safe zone
    $safeSize = $TargetSize * $ScaleFactor
    
    # Calculate aspect ratio
    $ratioX = $safeSize / $sourceImage.Width
    $ratioY = $safeSize / $sourceImage.Height
    $ratio = [Math]::Min($ratioX, $ratioY)

    $newWidth = [int]($sourceImage.Width * $ratio)
    $newHeight = [int]($sourceImage.Height * $ratio)

    # Center the image
    $posX = [int](($TargetSize - $newWidth) / 2)
    $posY = [int](($TargetSize - $newHeight) / 2)

    # Draw the image
    $graphics.DrawImage($sourceImage, $posX, $posY, $newWidth, $newHeight)

    # Save
    $bitmap.Save($DestFile, [System.Drawing.Imaging.ImageFormat]::Png)

    # Clean up
    $graphics.Dispose()
    $bitmap.Dispose()
    $sourceImage.Dispose()
    
    Write-Host "Generated $DestFile"
}

# Generate 192x192
Resize-ImageWithPadding -SourceFile $sourcePath -DestFile $destPath192 -TargetSize 192

# Generate 512x512
Resize-ImageWithPadding -SourceFile $sourcePath -DestFile $destPath512 -TargetSize 512
