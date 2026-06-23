$html = [System.IO.File]::ReadAllText("h:\work\Abdelrahman-portfolio\index.html", [System.Text.Encoding]::UTF8)

# Add slide-section class to each section
$html = $html -replace '<section id="([^"]+)" class="([^"]*)content-section([^"]*)">', '<section id="$1" class="$2 content-section slide-section $3">
<div class="slide-content-wrapper glass-panel">'

# Close the wrapper before the section ends
$html = $html -replace '</section>', '</div>
</section>'

[System.IO.File]::WriteAllText("h:\work\Abdelrahman-portfolio\index.html", $html, [System.Text.Encoding]::UTF8)
