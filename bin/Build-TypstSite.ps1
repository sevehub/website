<#
.SYNOPSIS
    Converts a directory of Typst (.typ) files into a mobile-friendly static HTML site.

.DESCRIPTION
    Wraps `typst compile --features html --format html` for every .typ file found
    (recursively) in a source directory, injects a responsive viewport meta tag +
    lightweight mobile CSS into each output file, and generates an index.html that
    links to every page. Supports a one-shot build or a -Watch mode that rebuilds
    automatically on file changes.

    Requires the Typst CLI on PATH (winget install --id Typst.Typst) and a recent
    Typst version (HTML export is experimental as of Typst 0.13+).

.PARAMETER SourceDir
    Directory containing .typ source files (searched recursively).

.PARAMETER OutputDir
    Directory where the generated HTML site is written. Created if missing.

.PARAMETER Watch
    Keep the script running and rebuild automatically when .typ files change.

.PARAMETER NoIndex
    Skip generating the index.html landing page.

.EXAMPLE
    .\Build-TypstSite.ps1 -SourceDir .\notes -OutputDir .\site

.EXAMPLE
    .\Build-TypstSite.ps1 -SourceDir .\notes -OutputDir .\site -Watch
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$SourceDir,

    [Parameter(Mandatory)]
    [string]$OutputDir,

    [switch]$Watch,
    [switch]$NoIndex
)

$ErrorActionPreference = 'Stop'

# --- Sanity checks -----------------------------------------------------
if (-not (Get-Command typst -ErrorAction SilentlyContinue)) {
    Write-Error "Typst CLI not found on PATH. Install it with: winget install --id Typst.Typst"
}

if (-not (Test-Path $SourceDir)) {
    Write-Error "Source directory '$SourceDir' does not exist."
}

$SourceDir = (Resolve-Path $SourceDir).Path
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$OutputDir = (Resolve-Path $OutputDir).Path

# Belt-and-braces: some Typst builds accept the feature via env var instead of the flag.
$env:TYPST_FEATURES = 'html'

# Typst writes UTF-8 with no BOM. PowerShell's Get-Content/Set-Content default to the
# system ANSI codepage without a BOM to hint otherwise, which mangles multi-byte
# characters (curly quotes, em dashes, etc.) into mojibake. Force UTF-8 explicitly
# everywhere we touch these files instead of relying on the -Encoding UTF8 cmdlet
# param (which on Windows PowerShell 5.1 still writes a BOM and doesn't fix reads).
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# --- Mobile-friendly head injected into every page ----------------------
$MobileHead = @'
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noai, noimageai">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Georgia&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="shortcut icon" href="/nwstheme/imgs/favicon.ico" type="image/x-icon">
<link rel="apple-touch-icon" href="/nwstheme/imgs/apple-touch-icon.png"/>
<link rel="apple-touch-icon" sizes="72x72" href="/nwstheme/imgs/apple-touch-icon-72x72.png"/>
<link rel="apple-touch-icon" sizes="114x114" href="/nwstheme/imgs/apple-touch-icon-114x114.png"/>
<link rel="stylesheet" href="/nwstheme/css/website.css">
<script src="/nwstheme/js/website.js"></script>
<link rel="stylesheet" href="https://tessarinseve.pythonanywhere.com/nws/theme/css/feedback.css">
<script src="https://tessarinseve.pythonanywhere.com/nws/theme/js/feedback.js" defer> </script> 
'@

$ExtendJS = @"
<script>
(function () {
  var nav = document.getElementById('sevetech-nav');
  var toggle = document.getElementById('theme-toggle');
  var html = document.documentElement;
  var lastY = window.scrollY;
  var threshold = 8; // px of scroll before we react, avoids jitter
 
  // ---- auto-hide on scroll direction ----
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (Math.abs(y - lastY) < threshold) return;
 
    if (y > lastY && y > 80) {
      nav.classList.add('nav-hidden');   // scrolling down -> hide
    } else {
      nav.classList.remove('nav-hidden'); // scrolling up -> show
    }
    lastY = y;
  }, { passive: true });
 
  // ---- theme toggle, persisted ----
  // Only sets data-theme when the user has explicitly chosen a theme.
  // Otherwise the attribute stays absent and prefers-color-scheme
  // (in website.css) is what drives light/dark.
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
 
  function applyTheme(theme, persist) {
    html.setAttribute('data-theme', theme);
    toggle.innerHTML = theme === 'dark' ? '&#9789;' : '&#9788;'; // moon / sun
    if (persist) localStorage.setItem('sevetech-theme', theme);
  }
 
  var saved = localStorage.getItem('sevetech-theme');
  if (saved) {
    applyTheme(saved, false);
  } else {
    toggle.innerHTML = prefersDark ? '&#9789;' : '&#9788;';
  }
 
  toggle.addEventListener('click', function () {
    var current = html.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
    applyTheme(current === 'dark' ? 'light' : 'dark', true);
  });
})();
</script>
"@

$NavBar = @"
<nav id="sevetech-nav">
  <div class="nav-left">
    <a href="index2026.html">&larr; Index</a>
    <span class="divider">|</span>
    <a href="https://sites.google.com/view/paperstackpro/home/blog" class="nav-brand">&#127968; PaperStackPro</a>
  </div>
  <button id="theme-toggle" aria-label="Toggle dark mode" title="Toggle theme">&#9788;</button>
</nav>
"@

$Footer = @"
<footer id="sevetech-footer">
  &copy; 2026 SeveTech. All rights reserved. No part of this site's content may be reproduced, distributed, or used to train machine learning models without prior written permission.
</footer>

"@
function Add-MobileHead {
    param([string]$HtmlPath)
    $content = [System.IO.File]::ReadAllText($HtmlPath, [System.Text.Encoding]::UTF8)
    if ($content -match '<head>') {
        $content = $content -replace '<head>', "<head>`n$MobileHead"
    }
    else {
        # Defensive fallback if Typst emits a bare fragment without <head>.
        $content = "<!DOCTYPE html>`n<html><head>$MobileHead</head><body>$NavBar$content$Footer</body></html>"
    }
    if ($content -match '<body>'){
        $content = $content -replace '<body>', "<body>$NavBar`n<button id='backToTop' aria-label='Back to top'>Top</button>`n<article><main>"
        $content = $content -replace '</body>', "</article></main>$Footer$ExtendJS</body>"
        }
    [System.IO.File]::WriteAllText($HtmlPath, $content, $Utf8NoBom)
}

function Build-One {
    param([System.IO.FileInfo]$TypFile)

    $relative     = $TypFile.FullName.Substring($SourceDir.Length).TrimStart('\', '/')
    $relativeHtml = [System.IO.Path]::ChangeExtension($relative, 'html')
    $outPath      = Join-Path $OutputDir $relativeHtml
    New-Item -ItemType Directory -Force -Path (Split-Path $outPath) | Out-Null

    Write-Host "Compiling $relative -> $relativeHtml" -ForegroundColor Cyan
    & typst compile --features html --format html $TypFile.FullName $outPath
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "typst failed on $relative"
        return $null
    }
    Add-MobileHead -HtmlPath $outPath
    return $relativeHtml
}

function Build-Index {
    param([string[]]$Pages)
    if ($NoIndex -or -not $Pages) { return }
    $links = $Pages | Sort-Object | ForEach-Object {
        $title = [System.IO.Path]::GetFileNameWithoutExtension($_)
            $title = ($title -replace '_', ' ')
            $title = (Get-Culture).TextInfo.ToTitleCase($title.ToLower())
            $href  = $_ -replace '\\', '/'
            "<li><a href=`"$href`">$title</a></li>"
    }



    $indexHtml = @"
<!DOCTYPE html>
<html>
<head>
$MobileHead
<title>SeveTech Blog 2026</title>
</head>
$ExtendJS
<body>
$NavBar
<h1>Blog 2026</h1>
<ul>
$($links -join "`n")
</ul>
$Footer
</body>
</html>
"@
    [System.IO.File]::WriteAllText((Join-Path $OutputDir 'index2026.html'), $indexHtml, $Utf8NoBom)
    Write-Host "Wrote index2026.html ($($Pages.Count) pages)" -ForegroundColor Green
}

function Build-All {
 
$typFiles = Get-ChildItem -Path $SourceDir -Filter '*.typ' -Recurse -File |
    Where-Object {
        $_.Name -ne 'website.typ' -and
        $_.FullName -notmatch '\\Figure\\'
    }


    if (-not $typFiles) {
        Write-Warning "No .typ files found under $SourceDir"
            return
    }
    $pages = foreach ($f in $typFiles) { Build-One -TypFile $f }
    $pages = $pages | Where-Object { $_ }
    Build-Index -Pages $pages
        Write-Host "Done. $($pages.Count)/$($typFiles.Count) files built to $OutputDir" -ForegroundColor Green
}

# --- Run -----------------------------------------------------------------
Build-All

if ($Watch) {
    Write-Host "Watching $SourceDir for changes (Ctrl+C to stop)..." -ForegroundColor Yellow

    $fsw = New-Object System.IO.FileSystemWatcher $SourceDir, '*.typ'
    $fsw.IncludeSubdirectories = $true
    $fsw.EnableRaisingEvents   = $true

    $action = { Start-Sleep -Milliseconds 300; Build-All }  # debounce rapid saves

    Register-ObjectEvent $fsw Changed -Action $action | Out-Null
    Register-ObjectEvent $fsw Created -Action $action | Out-Null
    Register-ObjectEvent $fsw Renamed -Action $action | Out-Null

    try {
        while ($true) { Start-Sleep -Seconds 1 }
    }
    finally {
        Get-EventSubscriber | Unregister-Event
        $fsw.Dispose()
    }
}
