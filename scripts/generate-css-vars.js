const fs = require('fs')
const path = require('path')

const tokensPath = path.join(__dirname, '../figma-tokens.json')
const outputPath = path.join(__dirname, '../src/styles/tokens.css')

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'))

let css = ':root {\n'

// Colors
if (tokens.colors) {
  Object.entries(tokens.colors).forEach(([key, value]) => {
    css += `  --color-${key}: ${value.value};\n`
  })
}

// Typography
if (tokens.typography?.fontFamily) {
  Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
    css += `  --font-${key}: ${value.value}, sans-serif;\n`
  })
}

// Border Radius
if (tokens.borderRadius) {
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    css += `  --radius-${key}: ${value.value};\n`
  })
}

// Spacing
if (tokens.spacing) {
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value.value};\n`
  })
}

css += '}\n'

// Ensure output directory exists
const outputDir = path.dirname(outputPath)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

fs.writeFileSync(outputPath, css, 'utf8')
console.log('✅ Generated CSS variables from design tokens')

