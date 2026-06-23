$js = [System.IO.File]::ReadAllText("h:\work\Abdelrahman-portfolio\script.js", [System.Text.Encoding]::UTF8)

$broken = "ctx.fillStyle = \
gba(255, 255, 255, \)\;"
$fixed = "ctx.fillStyle = 'rgba(255, 255, 255, ' + this.alpha + ')';"

$js = $js.Replace($broken, $fixed)

# Just in case the newline is different
$broken2 = "ctx.fillStyle = \
gba(255, 255, 255, \)\;"
$js = $js.Replace($broken2, $fixed)

[System.IO.File]::WriteAllText("h:\work\Abdelrahman-portfolio\script.js", $js, [System.Text.Encoding]::UTF8)
