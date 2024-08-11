import { $ } from "bun"
import { bitsToBytes, buildTree, encodeText, generateTable, getFreq, readTextFile, TreeChildNode } from "./utils"

const inputFileName = 'test.txt'
const outputFileName = 'compressed.txt'

const text = await readTextFile('/'+inputFileName)

const freqs: Record<string, number> = getFreq(text)

const nodes = Object.entries(freqs).map(([char, frq]) => new TreeChildNode(char, frq))

const tree = buildTree(nodes)

const table = generateTable(tree)

const encodedText = encodeText(text, table)

const convertedByteString = bitsToBytes(encodedText)

Bun.write(outputFileName, convertedByteString)

await $`echo compression done!! reduced by :`
await $`du -sh ${inputFileName}`
await $`du -sh ${outputFileName}`
