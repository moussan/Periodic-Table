$source = "D:\code\Periodic-Table\src"
$dest = "D:\code\Periodic-Table\jules_session_13525015865175624332\src"
Get-ChildItem -Path $source -Recurse | ForEach-Object {
    $targetPath = $_.FullName -replace [regex]::Escape($source), $dest
    if (-not (Test-Path $targetPath)) {
        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
        } else {
            Copy-Item -Path $_.FullName -Destination $targetPath -Force
        }
    }
}
