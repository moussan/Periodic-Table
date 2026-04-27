$source = "D:\code\Periodic-Table\src\lib\stores"
$dest = "D:\code\Periodic-Table\jules_session_13525015865175624332\src\lib\stores"
Get-ChildItem -Path $source | ForEach-Object {
    if ($_.Name -ne "filters.ts") {
        Copy-Item -Path $_.FullName -Destination $dest -Force -Recurse
    }
}
