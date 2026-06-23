$js = [System.IO.File]::ReadAllText("h:\work\Abdelrahman-portfolio\js\loader.js", [System.Text.Encoding]::UTF8)

$js = $js -replace 'window.THREE_MANAGER = new THREE.LoadingManager\(\);', ''
$js = "window.THREE_MANAGER = new THREE.LoadingManager();
" + $js

[System.IO.File]::WriteAllText("h:\work\Abdelrahman-portfolio\js\loader.js", $js, [System.Text.Encoding]::UTF8)
