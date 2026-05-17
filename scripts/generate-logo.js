// One-shot script that emits three logo assets to public/:
//
//   logo.svg            – scalable wordmark (icon + "Triplan") for headers/marketing
//   logo-mark.svg       – just the icon, scalable
//   logo-1024.png       – 1024×1024 square version for app store / social avatars
//
// Same brand palette as the favicon / OG image: coffee, sand, terracotta.
//
// Run with:  node scripts/generate-logo.js

import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUB = resolve(__dirname, '../public')

// ── 1. Icon mark - refined version of the favicon, made for larger sizes ──
const logoMarkSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="#1A1612"/>
      <stop offset="100%" stop-color="#2B221C"/>
    </linearGradient>
  </defs>

  <!-- Rounded coffee tile -->
  <rect width="256" height="256" rx="56" fill="url(#bg)"/>

  <!-- Globe (compass for travel): equator, meridian, axis -->
  <g transform="translate(128, 128)" stroke="#F5F0E8" stroke-width="11" fill="none" stroke-linecap="round">
    <circle r="68"/>
    <line x1="-68" y1="0" x2="68" y2="0"/>
    <ellipse rx="34" ry="68"/>
  </g>

  <!-- Terracotta pin marker - the "you-are-here" dot -->
  <circle cx="184" cy="72" r="28" fill="#C4622D"/>
  <circle cx="184" cy="72" r="10" fill="#1A1612" fill-opacity="0.18"/>
</svg>`

// ── 2. Wordmark - icon + "Triplan" laid out horizontally ──
const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 256" width="720" height="256">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="#1A1612"/>
      <stop offset="100%" stop-color="#2B221C"/>
    </linearGradient>
  </defs>

  <!-- Icon (same mark) -->
  <g>
    <rect width="256" height="256" rx="56" fill="url(#bg)"/>
    <g transform="translate(128, 128)" stroke="#F5F0E8" stroke-width="11" fill="none" stroke-linecap="round">
      <circle r="68"/>
      <line x1="-68" y1="0" x2="68" y2="0"/>
      <ellipse rx="34" ry="68"/>
    </g>
    <circle cx="184" cy="72" r="28" fill="#C4622D"/>
    <circle cx="184" cy="72" r="10" fill="#1A1612" fill-opacity="0.18"/>
  </g>

  <!-- Wordmark - "Triplan" in display serif, coffee on transparent so it can
       sit on any light background -->
  <text x="296" y="168" font-family="Georgia, 'Playfair Display', serif"
        font-size="128" fill="#1A1612" letter-spacing="-3">Triplan</text>
</svg>`

writeFileSync(resolve(PUB, 'logo-mark.svg'), logoMarkSvg)
writeFileSync(resolve(PUB, 'logo.svg'), logoSvg)
console.log(`[logo] wrote public/logo-mark.svg`)
console.log(`[logo] wrote public/logo.svg`)

// ── 3. 1024×1024 PNG for app stores / social profile pictures ──
await sharp(Buffer.from(logoMarkSvg), { density: 1024 })
  .resize(1024, 1024)
  .png({ compressionLevel: 9 })
  .toFile(resolve(PUB, 'logo-1024.png'))
console.log(`[logo] wrote public/logo-1024.png`)
