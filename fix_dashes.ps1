$files = @("h:\work\Abdelrahman-portfolio\index.html", "h:\work\Abdelrahman-portfolio\script.js")

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    
    # Replace padded em-dashes
    $content = $content.Replace(" — ", " | ")
    $content = $content.Replace(" - ", " | ")
    $content = $content.Replace(" – ", " | ")
    
    # Replace unpadded em-dashes
    $content = $content.Replace("—", " | ")
    
    [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
}
