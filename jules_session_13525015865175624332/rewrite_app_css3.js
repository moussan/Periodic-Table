const fs = require('fs');
let css = fs.readFileSync('src/app.css', 'utf-8');
css = css.replace(/@apply bg-background text-foreground;/g, '@apply bg-[color:var(--background)] text-[color:var(--foreground)];');
fs.writeFileSync('src/app.css', css);
