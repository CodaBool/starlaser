import fs from 'fs'
import path from 'path'

const SOURCE_DIR = path.resolve('../public/svg')
const COMBINED_DIR = path.join(SOURCE_DIR, 'main')
const MAP_FOLDERS = ['fallout', 'lancer']
const OTHER_FOLDERS = ['fontawesome', 'lucide', 'foundry']

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
}

function sanitizeName(folder, file) {
  const name = path.basename(file, '.svg')
  return `${folder}-${name}`
}

function readSvgContent(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function writeSvgContent(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8')
}

function processSvg(svg) {
  let updated = svg

  // Replace stroke="currentColor" and fill="currentColor" with white
  updated = updated.replace(/stroke="currentColor"/g, 'stroke="white"')
  updated = updated.replace(/fill="currentColor"/g, 'fill="white"')

  // Add stroke="white" to <path> if no stroke is already present
  updated = updated.replace(/<path\b(?![^>]*stroke=)/g, '<path stroke="white"')

  return updated
}

function buildIndex(folder, outName) {
  const dir = path.join(SOURCE_DIR, folder)
  const icons = fs.readdirSync(dir)
    .filter(f => f.endsWith('.svg'))
    .map(f => path.basename(f, '.svg'))

  fs.writeFileSync(
    path.join(SOURCE_DIR, `${outName}.json`),
    JSON.stringify(icons, null, 2)
  )
  console.log(`✓ Generated ${outName}.json`)
}

function copyAndProcessSvgs(fromFolder, toFolder) {
  const src = path.join(SOURCE_DIR, fromFolder)
  const dest = path.join(SOURCE_DIR, toFolder)

  ensureDir(dest)

  for (const file of fs.readdirSync(src)) {
    if (!file.endsWith('.svg')) continue
    const originalPath = path.join(src, file)
    const targetName = sanitizeName(fromFolder, file)
    const targetPath = path.join(dest, `${targetName}.svg`)

    const original = readSvgContent(originalPath)
    const updated = processSvg(original)

    writeSvgContent(targetPath, updated)
  }
}

function processFolder(folder) {
  const dir = path.join(SOURCE_DIR, folder)
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.svg')) continue
    const filePath = path.join(dir, file)
    const updated = processSvg(readSvgContent(filePath))
    writeSvgContent(filePath, updated)
  }
}

// ---- Run Everything ----

ensureDir(COMBINED_DIR)
for (const folder of OTHER_FOLDERS) {
  copyAndProcessSvgs(folder, 'main')
}
processFolder('main')

for (const folder of MAP_FOLDERS) {
  processFolder(folder)
}

buildIndex('main', 'main')
buildIndex('fallout', 'fallout')
buildIndex('lancer', 'lancer')

console.log('✨ SVG packaging complete.')
