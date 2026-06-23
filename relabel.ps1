$html = [System.IO.File]::ReadAllText("h:\work\Abdelrahman-portfolio\index.html", [System.Text.Encoding]::UTF8)

# Replace in mobile menu
$html = $html -replace '<span class="lang-en">About</span>', '<span class="lang-en">Mission Control</span>'
$html = $html -replace '<span class="lang-en">Campaigns</span>', '<span class="lang-en">Transmissions</span>'
$html = $html -replace '<span class="lang-en">Journey</span>', '<span class="lang-en">Flight Path</span>'
$html = $html -replace '<span class="lang-en">Credentials</span>', '<span class="lang-en">Flight Certifications</span>'

# Replace in desktop spine menu (data-title-en)
$html = $html -replace 'data-title-en="About"', 'data-title-en="Mission Control"'
$html = $html -replace 'data-title-en="Campaigns"', 'data-title-en="Transmissions"'
$html = $html -replace 'data-title-en="Journey"', 'data-title-en="Flight Path"'
$html = $html -replace 'data-title-en="Credentials"', 'data-title-en="Flight Certifications"'

# Replace the H2 headings in the actual sections
$html = $html -replace '<span class="lang-en">About Me</span>', '<span class="lang-en">Mission Control</span>'
$html = $html -replace '<span class="lang-en">Featured Campaigns</span>', '<span class="lang-en">Transmissions</span>'
$html = $html -replace '<span class="lang-en">My Journey</span>', '<span class="lang-en">Flight Path</span>'
$html = $html -replace '<span class="lang-en">Certifications & Credentials</span>', '<span class="lang-en">Flight Certifications</span>'

[System.IO.File]::WriteAllText("h:\work\Abdelrahman-portfolio\index.html", $html, [System.Text.Encoding]::UTF8)
