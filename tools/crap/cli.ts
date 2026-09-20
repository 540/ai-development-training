import { readFileSync } from 'node:fs'
import { crapGate, type CoverageReport } from './crap'

const REPORT_PATH = 'reports/coverage/coverage-final.json'

function readReport(): CoverageReport | null {
  try {
    return JSON.parse(readFileSync(REPORT_PATH, 'utf8')) as CoverageReport
  } catch {
    return null
  }
}

const result = crapGate(readReport())

console.log(result.message)
process.exit(result.exitCode)
