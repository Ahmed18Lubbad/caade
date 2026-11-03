$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$mediaRoot = Join-Path $root 'public/media'
$dataRoot = Join-Path $root 'public/data'

function Get-JsonReferencedMediaPaths {
    param([string]$DataDir)

    $paths = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)

    foreach ($file in @('ar.json', 'en.json')) {
        $jsonPath = Join-Path $DataDir $file
        if (-not (Test-Path -LiteralPath $jsonPath)) { continue }

        $jsonText = Get-Content -Path $jsonPath -Raw -Encoding UTF8
        $matches = [regex]::Matches($jsonText, '/media/[^"\s>]+')

        foreach ($match in $matches) {
            $value = $match.Value.Trim()
            if ($value) {
                $normalized = $value.Replace('\\', '/')
                [void]$paths.Add($normalized)
            }
        }
    }

    return $paths
}

$referenced = Get-JsonReferencedMediaPaths -DataDir $dataRoot

$unreferencedMedia = @()
Get-ChildItem -Path $mediaRoot -Recurse -File | ForEach-Object {
    $mediaPath = "/media/$($_.FullName.Substring($mediaRoot.Length + 1).Replace('\\', '/'))"
    if (-not $referenced.Contains($mediaPath)) {
        $unreferencedMedia += $_.FullName
    }
}

$extraRootFiles = @(
    'palestinian-style-preview.html',
    'ملف تعريفي copy.pdfالملف النهائي.pdf......جودة منخفضة-1.docx',
    'ملف تعريفي copy.pdfالملف النهائي.pdf......جودة منخفضة-1.pdf'
)

foreach ($name in $extraRootFiles) {
    $path = Join-Path $root $name
    if (Test-Path -LiteralPath $path) {
        $unreferencedMedia += $path
    }
}

$unreferencedMedia = $unreferencedMedia | Select-Object -Unique

if (-not $unreferencedMedia -or $unreferencedMedia.Count -eq 0) {
    Write-Host 'No unused files found.'
    exit 0
}

Write-Host 'Files to be removed:'
$unreferencedMedia | ForEach-Object { Write-Host " - $_" }

$response = Read-Host 'Do you want to delete these files? (Y/N)'
if ($response -notmatch '^[Yy]$') {
    Write-Host 'Deletion canceled.'
    exit 0
}

foreach ($path in $unreferencedMedia) {
    if (Test-Path -LiteralPath $path) {
        Remove-Item -Path $path -Force -Recurse
        Write-Host "Deleted: $path"
    }
}

Write-Host 'Cleanup complete.'
