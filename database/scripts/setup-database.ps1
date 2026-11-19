# One-time PostgreSQL setup for the Spine Advisory website (Windows PowerShell).
#
#   powershell -ExecutionPolicy Bypass -File database\scripts\setup-database.ps1
#
# Creates a least-privilege login role (spine_app) that owns two databases (spine_advisory and
# spine_advisory_test), writes the connection string to backend\.env, then applies the migrations and
# loads the website content. You are asked for the postgres superuser password; it is used only for this
# script and is not stored anywhere.
param(
  [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
  [string]$DbHost = "localhost",
  [int]$Port = 5432,
  [string]$Superuser = "postgres"
)
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$psql = Join-Path $PgBin "psql.exe"
if (-not (Test-Path $psql)) { throw "psql.exe not found in $PgBin. Pass -PgBin with your PostgreSQL bin folder." }

$secure = Read-Host "Password for PostgreSQL user '$Superuser'" -AsSecureString
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))

# Random password for the application role.
$bytes = New-Object byte[] 24
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$appPassword = [Convert]::ToBase64String($bytes).Replace('+', 'A').Replace('/', 'B').Replace('=', '')

function Invoke-Sql([string]$db, [string]$sql) {
  & $psql -h $DbHost -p $Port -U $Superuser -d $db -v ON_ERROR_STOP=1 -q -t -A -c $sql
  if ($LASTEXITCODE -ne 0) { throw "psql failed: $sql" }
}

Write-Host "Creating role spine_app (or resetting its password)..."
Invoke-Sql "postgres" "DO `$`$BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='spine_app') THEN CREATE ROLE spine_app LOGIN PASSWORD '$appPassword'; ELSE ALTER ROLE spine_app WITH LOGIN PASSWORD '$appPassword'; END IF; END`$`$;"

foreach ($db in @("spine_advisory", "spine_advisory_test")) {
  $exists = Invoke-Sql "postgres" "SELECT 1 FROM pg_database WHERE datname='$db'"
  if (-not $exists) {
    Write-Host "Creating database $db..."
    Invoke-Sql "postgres" "CREATE DATABASE $db OWNER spine_app ENCODING 'UTF8' TEMPLATE template0"
  } else {
    Write-Host "Database $db already exists."
  }
  Invoke-Sql $db "REVOKE ALL ON SCHEMA public FROM PUBLIC; GRANT ALL ON SCHEMA public TO spine_app;"
}
Remove-Item Env:\PGPASSWORD

# Point the backend at PostgreSQL.
$envFile = Join-Path $root "backend\.env"
if (-not (Test-Path $envFile)) { Copy-Item (Join-Path $root "backend\.env.example") $envFile }
$url = "postgres://spine_app:$appPassword@${DbHost}:$Port/spine_advisory"
$content = Get-Content $envFile | Where-Object { $_ -notmatch '^(DATABASE_URL|TEST_DATABASE_URL)=' }
$content += "DATABASE_URL=$url"
$content += "TEST_DATABASE_URL=postgres://spine_app:$appPassword@${DbHost}:$Port/spine_advisory_test"
Set-Content -Path $envFile -Value $content -Encoding utf8
Write-Host "Wrote DATABASE_URL to backend\.env"

Push-Location (Join-Path $root "backend")
try {
  npm run db:migrate
  npm run db:seed
} finally { Pop-Location }
Write-Host ""
Write-Host "Done. Start the API with: cd backend; npm run dev"
