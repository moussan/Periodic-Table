#!/bin/bash
sed -i 's/@tailwind base;/@import "tailwindcss";/' src/app.css
sed -i '/@tailwind components;/d' src/app.css
sed -i '/@tailwind utilities;/d' src/app.css
