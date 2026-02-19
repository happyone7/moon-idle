$q = Invoke-RestMethod "http://127.0.0.1:8188/queue"
$h = Invoke-RestMethod "http://127.0.0.1:8188/history"
Write-Host "Running:$($q.queue_running.Count) Pending:$($q.queue_pending.Count)"
$histCount = $h.PSObject.Properties.Name.Count
Write-Host "History count:$histCount"

$bgms = @()
$h.PSObject.Properties | ForEach-Object {
  $outputs = $_.Value.outputs
  if ($outputs) {
    $outputs.PSObject.Properties | ForEach-Object {
      $n = $_.Value
      if ($n.audio) {
        $n.audio | ForEach-Object {
          if ($_.filename -match 'bgm_') { $bgms += $_.filename }
        }
      }
    }
  }
}
Write-Host "BGM files in history: $($bgms.Count)"
$bgms | ForEach-Object { Write-Host "  $_" }
