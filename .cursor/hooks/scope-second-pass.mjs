import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const markPath = join(tmpdir(), 'argos-scope-second-pass')
const followupMessage =
  'Second pass: re-read the original user instructions. Check the files you just changed. Remove anything not required for that change (extra helpers, files, features). Do not add a new helper unless the asked change cannot live in the existing function. If already in scope, say so and stop.'

function isPlanningDoc(filePath) {
  return String(filePath).replaceAll('\\', '/').includes('/docs/superpowers/')
}

function writeOut(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`)
}

async function readStdinJson() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  const text = Buffer.concat(chunks).toString('utf8').trim()
  if (!text) return {}
  return JSON.parse(text)
}

function markEdit(filePath) {
  if (isPlanningDoc(filePath)) return
  writeFileSync(markPath, '1')
}

function handleStop(status, loopCount) {
  const hasMark = existsSync(markPath)
  if (hasMark) unlinkSync(markPath)
  const shouldFollow =
    status === 'completed' && Number(loopCount ?? 0) === 0 && hasMark
  if (shouldFollow) {
    writeOut({ followup_message: followupMessage })
    return
  }
  writeOut({})
}

const mode = process.argv[2]
const input = await readStdinJson()

if (mode === 'mark') {
  markEdit(input.file_path ?? '')
  writeOut({})
} else if (mode === 'stop') {
  handleStop(input.status, input.loop_count)
} else {
  writeOut({})
}
