$css = [System.IO.File]::ReadAllText("h:\work\Abdelrahman-portfolio\style.css")

# 1. Update variables
$oldRoot = ':root {
  --bg-primary: #000000;
  --bg-sidebar: rgba(0, 0, 0, 0.85);
  --bg-card: rgba(255, 255, 255, 0.015);
  --bg-card-hover: rgba(255, 255, 255, 0.035);
  
  --border-color: rgba(255, 255, 255, 0.05);
  --border-hover: rgba(255, 255, 255, 0.12);
  
  --color-gold: #F59E0B;
  --color-cyan: #06B6D4;
  --color-purple: #7C3AED;
  
  --text-primary: #f8fafc;
  --text-muted: #8a99ad;
  --text-dark: #475569;'

$newRoot = ':root {
  /* Space Weather Palette */
  --bg-primary: #0D1321;
  --bg-sidebar: rgba(13, 19, 33, 0.85);
  --bg-card: rgba(39, 76, 119, 0.1);
  --bg-card-hover: rgba(39, 76, 119, 0.25);
  
  --border-color: rgba(248, 249, 250, 0.08);
  --border-hover: rgba(255, 159, 28, 0.5);
  
  --color-gold: #FF9F1C;   /* Solar Flare mapped to gold for legacy class names */
  --color-cyan: #2EC4B6;   /* Aurora Emerald */
  --color-purple: #274C77; /* Ionosphere Blue */
  
  --text-primary: #F8F9FA;
  --text-muted: rgba(248, 249, 250, 0.6);
  --text-dark: #274C77;'

$css = $css.Replace($oldRoot, $newRoot)

# 2. Remove mesh gradients from .gradient-mesh
$css = $css -replace 'background: radial-gradient.*?;', 'background: transparent;'

# 3. Simplify linear gradients
$css = $css -replace 'background: linear-gradient\(90deg, var\(--color-gold\), var\(--color-cyan\), var\(--color-purple\)\);', 'background: var(--color-gold);'
$css = $css -replace 'background: linear-gradient\(90deg, var\(--color-cyan\), var\(--color-purple\)\);', 'background: var(--color-cyan);'
$css = $css -replace 'background: linear-gradient\(to bottom, var\(--color-gold\), var\(--color-cyan\), var\(--color-purple\)\);', 'background: var(--color-gold);'
$css = $css -replace 'background: linear-gradient\(135deg, var\(--color-gold\), var\(--color-cyan\)\);', 'background: var(--color-gold);'

# 4. Remove heavy box shadows and replace with subtle glows
$css = $css -replace 'box-shadow: 0 8px 25px rgba\(46, 196, 182, 0.35\);', 'box-shadow: 0 4px 15px rgba(255, 159, 28, 0.2);'

# 5. Add micro-animations: reduce heavy transforms to subtle 2px lifts
$css = $css -replace 'transform: translateY\(-5px\);', 'transform: translateY(-2px);'
$css = $css -replace 'transform: translateY\(-8px\);', 'transform: translateY(-3px);'

[System.IO.File]::WriteAllText("h:\work\Abdelrahman-portfolio\style.css", $css)
