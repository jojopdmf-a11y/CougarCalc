#!/usr/bin/env node
/**
 * Example locks for the free-tool drop.
 * 29.1 ms Delay path B
 * fret d(12)=12.750 Pass
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

const SPEED_BASE = 331.3
const SPEED_SLOPE = 0.606

function speedOfSoundMps(tempC) {
  return SPEED_BASE + SPEED_SLOPE * tempC
}

function pathBDelayMs(pathA_m, pathB_m, tempC) {
  return ((pathB_m - pathA_m) / speedOfSoundMps(tempC)) * 1000
}

function distanceFromNut(scale, fret) {
  return scale * (1 - 2 ** (-fret / 12))
}

function assert(cond, message) {
  if (!cond) {
    console.error(`FAIL  ${message}`)
    process.exitCode = 1
    return
  }
  console.log(`PASS  ${message}`)
}

const delayLock = JSON.parse(readFileSync(join(root, 'speaker-delay/locks.json'), 'utf8'))
const fretLock = JSON.parse(readFileSync(join(root, 'fret-position/locks.json'), 'utf8'))

const delayMs = pathBDelayMs(delayLock.pathA_m, delayLock.pathB_m, delayLock.tempC)
const delayDisplay = `${delayMs.toFixed(1)} ms`
assert(delayDisplay === delayLock.expectedDisplay, `Delay path B ${delayDisplay}`)
assert(delayLock.label === 'Delay path B', 'result label is Delay path B')

const d12 = distanceFromNut(fretLock.scaleLengthIn, fretLock.fret)
const d12Display = d12.toFixed(3)
const gate = Math.abs(d12 - fretLock.expectedIn) <= 5e-4 ? 'Pass' : 'Fail'
assert(d12Display === fretLock.expectedDisplay, `d(12)=${d12Display}`)
assert(gate === 'Pass', `d(12)=${d12Display} ${gate}`)

if (process.exitCode) {
  console.error('calc-pack example locks failed')
  process.exit(1)
}
console.log('calc-pack example locks ok')
