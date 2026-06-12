# Antigravity Dashboard Scraper Script

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Antigravity Daily News Scraper Dashboard  " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Ensure we run from the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($ScriptDir) {
    Set-Location $ScriptDir
}

# Run Python Scraper
Write-Host "[1/2] 正在启动 Python 爬虫程序..." -ForegroundColor Yellow
python scraper.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[2/3] 新闻数据抓取成功！" -ForegroundColor Green
    Write-Host "数据保存在: ./data/news.json" -ForegroundColor Gray
    Write-Host ""
    
    # 自动同步数据到 GitHub Pages
    $HasRemote = git remote
    if ($HasRemote) {
        Write-Host "[3/3] 正在自动同步最新数据到 GitHub..." -ForegroundColor Yellow
        git add data/news.json
        $CurrentTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Auto-update news data: $CurrentTime"
        git push origin main
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "=============================================" -ForegroundColor Green
            Write-Host "🎉 同步成功！GitHub Pages 正在重新发布网站。" -ForegroundColor Green
            Write-Host "您的在线网页将在约 10 秒后显示最新新闻数据！" -ForegroundColor Green
            Write-Host "=============================================" -ForegroundColor Green
        } else {
            Write-Host "[错误] 自动推送至 GitHub 失败，请检查您的网络连接或 Git 权限。" -ForegroundColor Red
        }
    } else {
        Write-Host "[3/3] 提示：未绑定远程 GitHub 仓库。" -ForegroundColor Yellow
        Write-Host "如果您已经建好 GitHub 仓库，请先在终端运行以下命令进行绑定：" -ForegroundColor Gray
        Write-Host "  git remote add origin <您的GitHub仓库网址>" -ForegroundColor Cyan
        Write-Host "  git push -u origin main" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "本地更新完成。双击 index.html 即可查看您的本地新闻看板！" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "[错误] 爬虫运行失败，请检查是否安装了 Python 并且网络通畅。" -ForegroundColor Red
}

Write-Host "=============================================" -ForegroundColor Cyan
