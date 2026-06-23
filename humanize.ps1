$html = [System.IO.File]::ReadAllText("h:\work\Abdelrahman-portfolio\index.html", [System.Text.Encoding]::UTF8)

$replacements = @{
    "Blending analytical precision with creative strategy: building brands, driving growth, and turning data into compelling stories." = "I build digital strategies based on hard data, not guesswork—driving real revenue and brand growth."
    "I am <strong>Abdelrahman</strong>, a digital marketer who believes every brand has a story worth telling, and every campaign should be built on real data, not guesswork." = "I am <strong>Abdelrahman</strong>. I help brands cut through the noise with data-backed marketing strategies and content that actually converts."
    "With hands-on experience in <strong>content strategy, social media management, brand development, and customer retention</strong>, I have helped Egyptian brands build their digital presence from scratch, including creating full marketing plans and buyer personas to executing multi-platform content campaigns." = "From building complete marketing funnels to executing cross-platform campaigns, I specialize in <strong>content strategy, social media growth, and brand development</strong>."
    "I bring <strong>structured thinking to creative work</strong>: measuring, iterating, and optimizing until the results speak for themselves." = "I don't just run ads or post content; I measure, iterate, and optimize until we hit your exact business goals."
    "Mission <em>Log</em>" = "Featured <em>Work</em>"
    "Core Competencies" = "My Toolkit"
    "Strategic marketing projects: end-to-end brand development, market research, and growth planning." = "Real projects, real numbers. A look at how I've built strategies and driven growth for different brands."
    "Built a comprehensive marketing plan for an Egyptian gifting brand covering brand positioning, customer research, content planning, marketing funnels, and growth-focused KPIs." = "Developed a top-to-bottom marketing playbook for an e-commerce gifting brand, mapping out the customer journey, content strategy, and precise KPIs to measure success."
    "Led full brand identity creation and marketing strategy for an Egyptian EdTech startup, handling everything from logo direction and tone of voice to content campaigns and competitive analysis." = "Directed the complete launch strategy for an Egyptian EdTech startup. Built the brand from zero, including market positioning, visual identity, and the first wave of content campaigns."
    "Structured UX and content audit for a hosting &amp; domain provider, identifying brand identity gaps, content quality issues, and conversion friction points." = "Conducted a deep-dive UX and content audit for a major hosting provider. Identified drop-off points and restructured their landing pages to instantly increase conversion rates."
}

foreach ($key in $replacements.Keys) {
    $html = $html.Replace($key, $replacements[$key])
}

[System.IO.File]::WriteAllText("h:\work\Abdelrahman-portfolio\index.html", $html, [System.Text.Encoding]::UTF8)
