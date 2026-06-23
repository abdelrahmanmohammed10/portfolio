$css = [System.IO.File]::ReadAllText("h:\work\Abdelrahman-portfolio\style.css", [System.Text.Encoding]::UTF8)

# 1. Update variables to pure black
$css = $css -replace '--bg-primary: #0D1321;', '--bg-primary: #000000;'
$css = $css -replace '--bg-sidebar: rgba\(13, 19, 33, 0.85\);', '--bg-sidebar: rgba(0, 0, 0, 0.85);'

# 2. Update gradient-mesh to completely transparent/hidden
$css = $css -replace 'background: radial-gradient\(circle at 10% 20%, rgba\(39, 76, 119, 0.25\) 0%, transparent 60%\),[\s\S]*?radial-gradient\(circle at 90% 80%, rgba\(46, 196, 182, 0.15\) 0%, transparent 60%\);', 'background: #000000;'

[System.IO.File]::WriteAllText("h:\work\Abdelrahman-portfolio\style.css", $css, [System.Text.Encoding]::UTF8)
