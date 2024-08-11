import { $ } from "bun"
import { parseArgs } from "util"
import { bitsToBytes, buildTree, encodeText, generateHeader, generateTable, getFreq, readTextFile, TreeChildNode } from "./utils"
import { appendFile } from "node:fs/promises";

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
  encode: {
  type: 'string',
  short: 'e',
  },
  decode: {
  type: 'string',
  short: 'd',
  },
  outputFileName: {
    type: 'string',
    short: 'o',
  }
  },
  strict: true,
  allowPositionals: true,
 });

if (values.encode && values.decode) {
  throw new Error('Cannot encode and decode at the same time')
}

if (!values.encode && !values.decode) {
  throw new Error('Please provide either encode or decode flag')
}

if (!values.outputFileName) {
  values.outputFileName = '_compressed.txt'
}

const iFile = await readTextFile('/'+values.encode)

const text = await iFile.text()

const freqs: Record<string, number> = getFreq(text)

const nodes = Object.entries(freqs).map(([char, frq]) => new TreeChildNode(char, frq))

const tree = buildTree(nodes)

const table = generateTable(tree)

const encodedText = encodeText(text, table)

const header = generateHeader(freqs, iFile.size)
const convertedByteHeader = JSON.stringify(header)
const convertedByteString = bitsToBytes(encodedText)
const totalBytes = Buffer.byteLength(convertedByteHeader) + Buffer.byteLength(convertedByteString)

await appendFile(values.outputFileName, convertedByteHeader)
await appendFile(values.outputFileName, convertedByteString)

await $`echo compression done!! reduced ${(Math.round((iFile.size - totalBytes) / iFile.size * 100))}% @ ${((iFile.size - totalBytes)/1000000).toFixed(1)}mb of file size. `
await $`du -sh ${values.encode}`
await $`du -sh ${values.outputFileName}`
