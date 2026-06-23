$css = [System.IO.File]::ReadAllText("h:\work\Abdelrahman-portfolio\style.css")

# 1. Subtle backdrop blur on header
$css = $css -replace '\.mobile-header \{', '.mobile-header { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); background: rgba(13, 19, 33, 0.85) !important;'

# 2. Refined typography tracking for small labels
$css = $css -replace '\.num \{', '.num { letter-spacing: 2px;'
$css = $css -replace '\.timestamp \{', '.timestamp { letter-spacing: 1px;'

[System.IO.File]::WriteAllText("h:\work\Abdelrahman-portfolio\style.css", $css)
