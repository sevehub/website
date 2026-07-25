#!/usr/bin/env pwsh

function Update-Sitemap {
    param(
        [string]$BaseSitemap = "./public/sitemap_base.xml",
        [string]$FinalSitemap = "./public/sitemap.xml",
        [string]$HtmlDir = "./public/paperstackpro",
        [string]$BaseUrl = "https://paperstackpro.surge.sh"
    )
    $root = Get-Location

    $basePath  = Join-Path $root $BaseSitemap
    $finalPath = Join-Path $root $FinalSitemap
    $htmlPath  = Join-Path $root $HtmlDir

    if (-not (Test-Path $basePath)) {
        Write-Error "Base sitemap not found: $basePath"
        exit 1
    }

    if (-not (Test-Path $htmlPath)) {
        Write-Error "HTML directory not found: $htmlPath"
        exit 1
    }

    # Read immutable base and strip any trailing </urlset>
    $base = Get-Content $basePath -Raw
    $base = $base -replace "</urlset>", ""

    $LF = "`n"
    $output = $base + $LF + "<!-- Auto-generated entries -->" + $LF

    Get-ChildItem $htmlPath -Filter *.html | ForEach-Object {
        $name    = $_.Name
        $url     = "$BaseUrl/$name"
        $lastmod = $_.LastWriteTime.ToString("yyyy-MM-dd")

        $output += @"
<url>
  <loc>$url</loc>
  <lastmod>$lastmod</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.5</priority>
</url>
"@
    }

    $output += "</urlset>$LF"

    [System.IO.File]::WriteAllText($finalPath, $output, [System.Text.Encoding]::UTF8)

    Write-Output "Sitemap updated: $finalPath"
}



Update-Sitemap
