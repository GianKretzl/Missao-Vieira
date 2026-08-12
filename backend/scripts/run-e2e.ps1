param(
  [switch]$KeepRunning
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Resolve-Path (Join-Path $ScriptDir "..")

Set-Location $BackendDir

Write-Host "[1/4] Subindo PostgreSQL via Docker Compose..." -ForegroundColor Cyan
docker compose up -d postgres | Out-Null

Write-Host "[2/4] Aguardando banco ficar pronto..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  $null = docker compose exec -T postgres pg_isready -U postgres -d postgres 2>$null
  if ($LASTEXITCODE -eq 0) {
    $ready = $true
    break
  }
  Start-Sleep -Seconds 2
}

if (-not $ready) {
  throw "PostgreSQL não ficou pronto no tempo esperado."
}

if (-not $env:DATABASE_URL) {
  $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/missao_vieira"
}
if (-not $env:TEST_DATABASE_URL) {
  $env:TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/missao_vieira_test"
}

Write-Host "[3/4] Executando pytest E2E..." -ForegroundColor Cyan
python -m pytest -q
$testExit = $LASTEXITCODE

if (-not $KeepRunning) {
  Write-Host "[4/4] Encerrando containers..." -ForegroundColor Cyan
  docker compose down | Out-Null
} else {
  Write-Host "[4/4] Containers mantidos em execução (-KeepRunning)." -ForegroundColor Yellow
}

exit $testExit
