import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcRoot = join(root, 'src')
const snapshotPath = join(root, 'evals', '.snapshot.json')

function toPosix(filePath) {
  return filePath.replaceAll('\\', '/')
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, files)
    else files.push(abs)
  }
  return files
}

function hashFile(abs) {
  return createHash('sha256').update(readFileSync(abs)).digest('hex')
}

function srcHashes() {
  const hashes = {}
  for (const abs of walk(srcRoot)) {
    hashes[toPosix(relative(root, abs))] = hashFile(abs)
  }
  return hashes
}

function allowedSet(allowed) {
  const set = new Set(allowed)
  for (const path of allowed) {
    if (path.endsWith('.ts') || path.endsWith('.tsx'))
      set.add(path.replace(/\.tsx?$/, '.test.ts'))
  }
  return set
}

function changedPaths(before, after) {
  const changed = []
  for (const [path, hash] of Object.entries(after)) {
    if (before[path] !== hash) changed.push(path)
  }
  for (const path of Object.keys(before)) {
    if (!(path in after)) changed.push(path)
  }
  return changed
}

const [command, casePath] = process.argv.slice(2)

if (command === 'snapshot') {
  writeFileSync(snapshotPath, `${JSON.stringify(srcHashes(), null, 2)}\n`)
  process.stdout.write(`wrote ${toPosix(relative(root, snapshotPath))}\n`)
  process.exit(0)
}

if (command !== 'check') {
  process.stderr.write('usage: node evals/score.mjs snapshot | check <case.json>\n')
  process.exit(1)
}

if (!casePath || !existsSync(casePath)) {
  process.stderr.write('check requires an existing case json path\n')
  process.exit(1)
}

if (!existsSync(snapshotPath)) {
  process.stderr.write('no snapshot; run: node evals/score.mjs snapshot\n')
  process.exit(1)
}

const caseData = JSON.parse(readFileSync(casePath, 'utf8'))
const allowed = allowedSet(caseData.allowed ?? [])
const changed = changedPaths(
  JSON.parse(readFileSync(snapshotPath, 'utf8')),
  srcHashes(),
)
const forbidden = changed.filter(path => !allowed.has(path))
if (forbidden.length) {
  process.stderr.write(`out of scope:\n${forbidden.join('\n')}\n`)
  process.exit(1)
}

const test = spawnSync('npm', ['test'], { cwd: root, stdio: 'inherit', shell: true })
process.exit(test.status ?? 1)
