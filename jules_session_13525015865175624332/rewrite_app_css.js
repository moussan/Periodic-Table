const fs = require('fs');
let css = fs.readFileSync('src/app.css', 'utf-8');
css = css.replace('@apply border-border;', '@apply border-[color:var(--color-border)];');
fs.writeFileSync('src/app.css', css);
