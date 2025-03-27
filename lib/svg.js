import fs from 'fs'
import path from 'path'

const SOURCE_DIR = path.resolve('../public/svg')
const COMBINED_DIR = path.join(SOURCE_DIR, 'main')
const MAP_FOLDERS = ['fallout', 'lancer']
const OTHER_FOLDERS = ['junk.fontawesome', 'junk.lucide', 'junk.foundry']

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

/*
  this is a god awful ai generated slop function
  absolutely riddled with issues
  if I ever come back to this. I'd prefer to use a JSDOM parser
  and edit properties using that instead of regex
*/
function processSvg(svg) {
  let updated = svg

  // Remove comments that start with <!--! and end with -->
  updated = updated.replace(/<!--!.*?-->/gs, '')

  // Replace stroke="currentColor" and fill="currentColor" with white
  updated = updated.replace(/stroke="currentColor"/g, 'stroke="white"')
  updated = updated.replace(/fill="currentColor"/g, 'fill="white"')

  // Add stroke="white" to <path> if no stroke is already present
  updated = updated.replace(/<path\b(?![^>]*stroke=)/g, '<path stroke="white"')

  // Remove width="*" but only if it has a space before it
  updated = updated.replace(/(\s)width="[^"]*"/g, '$1')

  // Remove height="*" but only if it has a space before it
  updated = updated.replace(/(\s)height="[^"]*"/g, '$1')

  // Remove all style="*"
  updated = updated.replace(/style="[^"]*"/g, '')

  // Set fixed width and height if not present
  if (!updated.match(/<svg\b[^>]*\bwidth="[^"]*"/)) {
    updated = updated.replace(/<svg\b([^>]*)>/, '<svg $1 width="20">')
  }
  if (!updated.match(/<svg\b[^>]*\bheight="[^"]*"/)) {
    updated = updated.replace(/<svg\b([^>]*)>/, '<svg $1 height="20">')
  }

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
  const realFolderName = fromFolder.split("junk.")[1]

  ensureDir(dest)

  for (const file of fs.readdirSync(src)) {
    if (!file.endsWith('.svg')) continue
    const originalPath = path.join(src, file)
    const targetName = sanitizeName(fromFolder, file)
    const targetPath = path.join(dest, `${realFolderName}.svg`)

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
