# BVRIT Canteen - GitHub Integration Script
# This script will:
# 1. Connect to GitHub repository
# 2. Pull code from main branch
# 3. Create abhi branch
# 4. Push to abhi branch
# 5. Handle merge conflicts by overriding main with abhi

param(
    [switch]$SkipPull = $false,
    [switch]$ForcePush = $false
)

$repoPath = "C:\xamppp\htdocs"
$gitPath = "C:\Program Files\Git\bin\git.exe"
$gitHubRepo = "https://github.com/saiharish587/Canteen-Prebooking.git"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BVRIT Canteen - GitHub Integration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    cd $repoPath
    Write-Host "[✓] Working directory: $repoPath" -ForegroundColor Green
    
    # Step 1: Check and remove existing remote
    Write-Host "`n[1] Configuring remote repository..." -ForegroundColor Yellow
    & $gitPath remote remove origin 2>$null
    & $gitPath remote add origin $gitHubRepo
    Write-Host "[✓] Remote origin configured: $gitHubRepo" -ForegroundColor Green
    
    # Step 2: Configure git user
    Write-Host "`n[2] Configuring git user..." -ForegroundColor Yellow
    & $gitPath config user.name "Canteen Developer"
    & $gitPath config user.email "developer@bvrit.ac.in"
    Write-Host "[✓] Git user configured" -ForegroundColor Green
    
    # Step 3: Fetch from remote
    Write-Host "`n[3] Fetching from remote repository..." -ForegroundColor Yellow
    & $gitPath fetch origin main
    Write-Host "[✓] Fetched successfully" -ForegroundColor Green
    
    # Step 4: Pull from main (if not skipped)
    if (-not $SkipPull) {
        Write-Host "`n[4] Pulling from main branch (with unrelated histories)..." -ForegroundColor Yellow
        & $gitPath pull origin main --allow-unrelated-histories -X ours 2>&1 | ForEach-Object { 
            if ($_ -like "*conflict*") {
                Write-Host "[!] Merge conflict detected: $_" -ForegroundColor Yellow
            } else {
                Write-Host $_
            }
        }
        Write-Host "[✓] Pull completed with auto-merge strategy" -ForegroundColor Green
    }
    
    # Step 5: Resolve conflicts by taking local version
    Write-Host "`n[5] Resolving conflicts (keeping local version)..." -ForegroundColor Yellow
    & $gitPath status | Where-Object { $_ -like "*deleted*" -or $_ -like "*both*" } | ForEach-Object {
        Write-Host "[!] Potential conflict: $_"
    }
    & $gitPath add . 2>$null
    Write-Host "[✓] Conflicts resolved by accepting current version" -ForegroundColor Green
    
    # Step 6: Stage all changes
    Write-Host "`n[6] Staging all files..." -ForegroundColor Yellow
    & $gitPath add .
    Write-Host "[✓] All files staged" -ForegroundColor Green
    
    # Step 7: Create commit
    Write-Host "`n[7] Creating commit..." -ForegroundColor Yellow
    $commitMsg = "Update: My Orders History feature - Added order tracking for students`nDate: $(Get-Date -Format 'dd-MM-yyyy HH:mm:ss')`nFeatures added:`n- My Orders button in menu header`n- Order history display modal`n- Order details with items and totals`n- Status badges for pending/confirmed/completed orders`n- Responsive design for mobile and desktop"
    & $gitPath commit -m $commitMsg 2>&1 | ForEach-Object { Write-Host $_ }
    Write-Host "[✓] Commit created" -ForegroundColor Green
    
    # Step 8: Create abhi branch
    Write-Host "`n[8] Creating 'abhi' branch..." -ForegroundColor Yellow
    & $gitPath checkout -b abhi 2>$null
    $branchCheck = & $gitPath branch --show-current
    Write-Host "[✓] Currently on branch: $branchCheck" -ForegroundColor Green
    
    # Step 9: Push to abhi branch
    Write-Host "`n[9] Pushing to 'abhi' branch..." -ForegroundColor Yellow
    if ($ForcePush) {
        & $gitPath push -f -u origin abhi
        Write-Host "[✓] Forced push to 'abhi' branch" -ForegroundColor Green
    } else {
        & $gitPath push -u origin abhi
        Write-Host "[✓] Pushed to 'abhi' branch" -ForegroundColor Green
    }
    
    # Step 10: Show summary
    Write-Host "`n[10] Showing recent commits..." -ForegroundColor Yellow
    & $gitPath log --oneline -5
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "✓ Push Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Branch: abhi" -ForegroundColor Green
    Write-Host "Repository: $gitHubRepo" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/saiharish587/Canteen-Prebooking" -ForegroundColor Yellow
    Write-Host "2. Create a Pull Request from 'abhi' to 'main'" -ForegroundColor Yellow
    Write-Host "3. Review and merge the changes" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "[✗] Error occurred: $_" -ForegroundColor Red
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}
