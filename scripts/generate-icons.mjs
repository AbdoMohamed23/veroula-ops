import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

function iconSvg(size) {
  const fontSize = Math.round(size * 0.58)
  const y = Math.round(size * 0.68)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <text x="${size / 2}" y="${y}" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="${fontSize}" font-weight="700" fill="#FFFFFF">$</text>
</svg>`
}

async function writePng(size, filename) {
  const svg = iconSvg(size)
  const base = filename.replace('.png', '')
  await writeFile(join(root, `${base}.svg`), svg, 'utf8')
  await sharp(Buffer.from(svg)).png().toFile(join(root, filename))
}

await mkdir(root, { recursive: true })
await writePng(64, 'favicon.png')
await writePng(192, 'icon-192.png')
await writePng(512, 'icon-512.png')
await writePng(180, 'apple-touch-icon.png')

console.log('Generated PWA icons (black bg, white $)')
