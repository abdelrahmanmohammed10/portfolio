$html = [System.IO.File]::ReadAllText("h:\work\Abdelrahman-portfolio\index.html", [System.Text.Encoding]::UTF8)

$html = $html.Replace("driving real revenue and brand growth", "driving impactful results and brand growth")
$html = $html.Replace("Real projects, real numbers.", "Comprehensive strategies, measurable impact.")
$html = $html.Replace("real-world excellence", "practical excellence")

[System.IO.File]::WriteAllText("h:\work\Abdelrahman-portfolio\index.html", $html, [System.Text.Encoding]::UTF8)
