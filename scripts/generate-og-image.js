// One-shot script to generate the social preview image (Open Graph + Twitter card).
// Output: public/og-image.png at 1200×630, the recommended size for WhatsApp,
// Twitter, Facebook, iMessage, LinkedIn previews.
//
// Run with:  node scripts/generate-og-image.js
//
// The design mirrors the in-app brand: coffee #1A1612 backdrop, sand #F5F0E8
// foreground, terracotta #C4622D accent — same palette as the favicon and
// the dark hero on LandingPage / AuthPage.

import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PNG  = resolve(__dirname, '../public/og-image.png')

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <!-- Warm radial accents in the corners, matching the LandingPage hero -->
    <radialGradient id="warm" cx="0.85" cy="0.85" r="0.7">
      <stop offset="0%" stop-color="#C4622D" stop-opacity="0.32"/>
      <stop offset="55%" stop-color="#C4622D" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cool" cx="0.15" cy="0.15" r="0.6">
      <stop offset="0%" stop-color="#2D6B6B" stop-opacity="0.22"/>
      <stop offset="55%" stop-color="#2D6B6B" stop-opacity="0"/>
    </radialGradient>
    <!-- Subtle vignette for depth -->
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="60%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.35"/>
    </radialGradient>
    <!-- Route line gradient -->
    <linearGradient id="route" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#C4622D"/>
      <stop offset="100%" stop-color="#F5C842"/>
    </linearGradient>
  </defs>

  <!-- Coffee background -->
  <rect width="1200" height="630" fill="#1A1612"/>
  <rect width="1200" height="630" fill="url(#cool)"/>
  <rect width="1200" height="630" fill="url(#warm)"/>
  <rect width="1200" height="630" fill="url(#vignette)"/>

  <!-- Faint grid of latitude/longitude lines for atlas feel -->
  <g stroke="#F5F0E8" stroke-opacity="0.05" stroke-width="1">
    <line x1="0" y1="158" x2="1200" y2="158"/>
    <line x1="0" y1="315" x2="1200" y2="315"/>
    <line x1="0" y1="472" x2="1200" y2="472"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
  </g>

  <!-- Brand mark in top-left: same shape as favicon, scaled up -->
  <g transform="translate(72, 70)">
    <rect width="68" height="68" rx="15" fill="#C4622D"/>
    <g transform="translate(34, 34)">
      <circle r="18" stroke="#FFF" stroke-width="2.6" fill="none"/>
      <line x1="-18" y1="0" x2="18" y2="0" stroke="#FFF" stroke-width="2.6"/>
      <ellipse rx="9" ry="18" stroke="#FFF" stroke-width="2.6" fill="none"/>
    </g>
    <text x="86" y="46" font-family="Georgia, 'Playfair Display', serif"
          font-size="38" fill="#F5F0E8" letter-spacing="-0.5">Triplan</text>
  </g>

  <!-- ─── Decorative route on the right half ─── -->
  <g transform="translate(720, 130)" opacity="0.95">
    <!-- Dashed route line connecting four pins -->
    <path d="M 60,80
             C 130,40 200,60 250,140
             S 330,260 380,250
             S 430,200 380,140"
          stroke="url(#route)" stroke-width="4" fill="none"
          stroke-dasharray="2 8" stroke-linecap="round"/>

    <!-- Day 1 pin (terracotta) -->
    <g transform="translate(60, 80)">
      <circle r="22" fill="#1A1612" stroke="#C4622D" stroke-width="3"/>
      <text y="6" font-family="'DM Sans', sans-serif" font-size="16" font-weight="700"
            text-anchor="middle" fill="#C4622D">1</text>
    </g>

    <!-- Day 2 pin (teal) -->
    <g transform="translate(250, 140)">
      <circle r="22" fill="#1A1612" stroke="#2D6B6B" stroke-width="3"/>
      <text y="6" font-family="'DM Sans', sans-serif" font-size="16" font-weight="700"
            text-anchor="middle" fill="#2D6B6B">2</text>
    </g>

    <!-- Day 3 pin (mustard) -->
    <g transform="translate(380, 250)">
      <circle r="22" fill="#1A1612" stroke="#F5C842" stroke-width="3"/>
      <text y="6" font-family="'DM Sans', sans-serif" font-size="16" font-weight="700"
            text-anchor="middle" fill="#F5C842">3</text>
    </g>

    <!-- Day 4 pin (cream end pin) -->
    <g transform="translate(380, 140)">
      <circle r="22" fill="#F5F0E8"/>
      <text y="6" font-family="'DM Sans', sans-serif" font-size="16" font-weight="700"
            text-anchor="middle" fill="#1A1612">4</text>
    </g>
  </g>

  <!-- ─── Main headline ─── -->
  <text x="72" y="340" font-family="Georgia, 'Playfair Display', serif"
        font-size="76" fill="#F5F0E8" letter-spacing="-1.5">Plan trips that</text>
  <text x="72" y="420" font-family="Georgia, 'Playfair Display', serif"
        font-style="italic" font-size="76" fill="#C4622D" letter-spacing="-1.5">actually happen.</text>

  <!-- Sub-headline -->
  <text x="72" y="478" font-family="'DM Sans', Helvetica, Arial, sans-serif"
        font-size="24" fill="#F5F0E8" fill-opacity="0.65" letter-spacing="-0.2">
    Maps, itineraries, packing lists and photos in one place.
  </text>

  <!-- Tag pills at the bottom -->
  <g font-family="'DM Sans', Helvetica, Arial, sans-serif" font-size="16" fill="#F5F0E8" fill-opacity="0.85">
    <g transform="translate(72, 530)">
      <rect width="118" height="40" rx="20" fill="#F5F0E8" fill-opacity="0.08" stroke="#F5F0E8" stroke-opacity="0.15"/>
      <text x="22" y="25">Itinerary</text>
      <circle cx="14" cy="20" r="3" fill="#C4622D"/>
    </g>
    <g transform="translate(204, 530)">
      <rect width="100" height="40" rx="20" fill="#F5F0E8" fill-opacity="0.08" stroke="#F5F0E8" stroke-opacity="0.15"/>
      <text x="22" y="25">Group</text>
      <circle cx="14" cy="20" r="3" fill="#2D6B6B"/>
    </g>
    <g transform="translate(318, 530)">
      <rect width="118" height="40" rx="20" fill="#F5F0E8" fill-opacity="0.08" stroke="#F5F0E8" stroke-opacity="0.15"/>
      <text x="22" y="25">Offline</text>
      <circle cx="14" cy="20" r="3" fill="#F5C842"/>
    </g>
    <g transform="translate(450, 530)">
      <rect width="98" height="40" rx="20" fill="#F5F0E8" fill-opacity="0.08" stroke="#F5F0E8" stroke-opacity="0.15"/>
      <text x="22" y="25">Free</text>
      <circle cx="14" cy="20" r="3" fill="#F5F0E8"/>
    </g>
  </g>

  <!-- Domain tag in bottom-right -->
  <text x="1128" y="556" text-anchor="end" font-family="'DM Sans', Helvetica, Arial, sans-serif"
        font-size="15" fill="#F5F0E8" fill-opacity="0.4" letter-spacing="0.5">triplan.app</text>
</svg>`

mkdirSync(dirname(OUT_PNG), { recursive: true })

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, quality: 95 })
  .toFile(OUT_PNG)

console.log(`[og] wrote ${OUT_PNG}`)
