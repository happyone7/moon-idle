# 첫 번째 에러 상세 확인
$h = Invoke-RestMethod "http://127.0.0.1:8188/history?max_items=3"
$h.PSObject.Properties | Select-Object -First 1 | ForEach-Object {
  $id = $_.Name
  $item = $_.Value
  Write-Host "=== Prompt ID: $id ==="
  Write-Host "Status: $($item.status.status_str)"
  Write-Host "Messages:"
  $item.status.messages | ForEach-Object {
    Write-Host "  $($_ | ConvertTo-Json -Depth 5 -Compress)"
  }
  Write-Host "Outputs:"
  Write-Host ($item.outputs | ConvertTo-Json -Depth 5)
  Write-Host "Prompt nodes:"
  $item.prompt[2].PSObject.Properties | Select-Object -First 3 | ForEach-Object {
    Write-Host "  node $($_.Name): $($_.Value.class_type)"
  }
}
