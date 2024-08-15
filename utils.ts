import { $ } from "bun"
import { appendFile } from "node:fs/promises";
import { MermaidGraph, TreeChildNode, TreeNode } from "./classes";

export const readTextFile = async (path: string) => {
  const f = await Bun.file(__dirname + path)

  if (!f.exists()) {
    throw new Error('File not found')
  }

  return f
}

export const getFreq = (text: string) => text?.split('').reduce((acc, val) => {
  acc[val] = acc[val] ? acc[val] + 1 : 1
  return acc
}, {} as any)


export const buildTree = (nodes: any[]): TreeNode => {
  const sortedNodes = nodes.sort((a, b) => (a?.value || a.freq) - (b?.value || b.freq))

  if (sortedNodes.length === 1) return sortedNodes[0]

  const [f, s] = sortedNodes.splice(0, 2)
  const treeNode = new TreeNode()
  treeNode.setLeftNode(f)
  treeNode.setRightNode(s)

  sortedNodes.unshift(treeNode)

  return buildTree(sortedNodes)
}

export const generateTable = (node: any, table: any = {}, path = ''): Record<string, string> => {
  const rN = node.rightNode
  const lN = node.leftNode

  if (rN) {
    path += '1'
    if (rN?.character) {
      table[rN?.character] = path
    } else {
      generateTable(rN, table, path)
    }
  }

  if (lN) {
    path += '0'
    if (lN?.character) {
      table[lN?.character] = path
    } else {
      generateTable(lN, table, path)
    }
  }

  return table
}

export const encodeText = (text: string, table: Record<string, string>) => {
  if (!text || !Object.values(table).length) return ''

  return text.split('').map(c => table[c]).join('')
}

export function bitsToBytes(bitString: string) {
  if (!bitString) return new Uint8Array()

  const padding = (8 - (bitString.length % 8)) % 8;
  const paddedBitString = bitString + '0'.repeat(padding);
  const byteArray = [];
  for (let i = 0; i < paddedBitString.length; i += 8) {
    const byte = paddedBitString.slice(i, i + 8);
    byteArray.push(parseInt(byte, 2)); // Convert binary string to integer
  }
  return new Uint8Array(byteArray);
}

export function bytesToBits(bytesArray: ArrayBuffer) {
  const fixedArray = new Uint8Array(bytesArray)

  const bitArray = [];
  for (const byte of fixedArray) {
    const bits = byte.toString(2).padStart(8, '0');
    bitArray.push(bits);
  }

  return bitArray
}

export const generateHeader = (freqs: Record<string, number>, fileSize: number) => ({
  version: "1.0",
  originalFileSize: fileSize,
  characterFrequencies: freqs,
  algo: 'huffman'
})

export const buildEssential = async (text: string = '', frq: Record<string, number> = {}) => {
  const freqs: Record<string, number> = Object.keys(frq).length ? frq : getFreq(text)

  const nodes = Object.entries(freqs).map(([char, frq]) => new TreeChildNode(char, frq))

  const tree = buildTree(nodes)

  const mermaid = new MermaidGraph(tree)



  const table = generateTable(tree)

  return {
    freqs,
    table,
    tree
  }
}

const dest = (p: string, t: TreeNode) => p === '0' ? t.leftNode : t.rightNode

export const traverseNode = (paths: string[], tree: TreeNode) => {
  if (!paths.length) return null

  let parsedTxt = ''
  const initialLength = paths.length

  while (paths.length !== 0) {
    const path = paths.shift()

    if (!path) throw new Error('Invalid path')

    const n = dest(path, tree)
    if (n instanceof TreeChildNode && n.character) {
      parsedTxt += n.character
    } else if (n instanceof TreeNode && (n.leftNode || n.rightNode)) {
      parsedTxt += traverseNode(paths, n)
    } else {
      throw new Error('Invalid tree node')
    }

    const percentComplete = ((initialLength - paths.length) / initialLength) * 100
    process.stdout.write(`Percent complete: ${percentComplete.toFixed(2)}%\r`)
  }

  return parsedTxt
}

export const parseBitsCustom = (bitsString: string[], tree: any) => {
  let parsedTxt = ''

  if (!bitsString.length) return parsedTxt

  if (!tree) throw new Error('Missing Tree to traverse')

  return traverseNode(bitsString, tree)
}

export const parseBitToCharacter = (bitsString: string) => {
  return String.fromCharCode(parseInt(bitsString, 2))
}

export const parseBitsToText = (bitsString: string[], tree: any = {}) => {
  if (Object.keys(tree).length === 0) return bitsString.map(d => parseBitToCharacter(d)).join('')

  return parseBitsCustom(bitsString.join('').split(''), tree)
}

export const getHeader = (bits: string[]) => {
  const hStartBits = ['00111100', '01101000', '01100101', '01100001', '01100100', '01100101', '01110010', '00111110']
  const hEndBits = ['00111100', '00101111', '01101000', '01100101', '01100001', '01100100', '01100101', '01110010', '00111110']

  const bitStart = bits.slice(0, hStartBits.length)

  if (bitStart.join('') !== hStartBits.join('')) {
    throw new Error('Cannot find header start: Bad metadata')
  }

  let headerEndIndexBit = -1

  for (let i = hStartBits.length; i < bits.length; i++) {
    if (bits[i] !== hEndBits[0]) continue

    let found = true
    for (let j = 0; j < hEndBits.length; j++) {
      if (bits[i + j] !== hEndBits[j]) {
        found = false
        break
      }
    }

    if (found) {
      headerEndIndexBit = i + hEndBits.length
      break
    }
  }

  if (headerEndIndexBit === -1) {
    throw new Error('Cannot find header end: Bad metadata')
  }

  const headerBits = bits.slice(0, headerEndIndexBit)
  const rawHeader = parseBitsToText(headerBits) || ''
  const header = rawHeader.replaceAll('<header>', '').replaceAll('</header>', '')

  try {
    return { header: JSON.parse(header), headerEndIndexBit }
  } catch (e) {
    throw new Error('Cannot parse header: Bad metadata')
  }
}

// Convert bytes to KB, MB, GB, or TB and format the output
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024; // 1 KB = 1024 Bytes
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));
  return `${formattedSize} ${sizes[i]}`;
}

export const compressionTool = {
  encoding: async (cmdArgs: any) => {
    const iFile = await readTextFile('/' + (cmdArgs.encode || cmdArgs.decode))

    const text = await iFile.text()

    const { freqs, table, tree } = await buildEssential(text)

    if (cmdArgs.mermaid) new MermaidGraph(tree).generate('mermaidgraphEncoding.md')

    const encodedText = encodeText(text, table)

    const header = generateHeader(freqs, iFile.size)
    const convertedByteHeader = `<header>${JSON.stringify(header)}</header>`
    const convertedByteString = bitsToBytes(encodedText)
    const totalBytes = Buffer.byteLength(convertedByteHeader) + Buffer.byteLength(convertedByteString)

    await $`rm -f ${cmdArgs.outputFileName}`

    await appendFile(cmdArgs.outputFileName, convertedByteHeader)
    await appendFile(cmdArgs.outputFileName, convertedByteString)

    await $`echo compression done!! reduced ${(Math.round((iFile.size - totalBytes) / iFile.size * 100))}% [${((iFile.size - totalBytes) / 1000000).toFixed(1)}mb] of file size. `
    await $`du -sh ${cmdArgs.encode}`
    await $`du -sh ${cmdArgs.outputFileName}`
  },
  decoding: async (cmdArgs: any) => {
    const iFile = await readTextFile('/' + (cmdArgs.encode || cmdArgs.decode))

    const decodedArrayBuffer = await iFile.arrayBuffer()
    const decodedBits = bytesToBits(decodedArrayBuffer)
    const { header, headerEndIndexBit } = getHeader(decodedBits)

    const { freqs, tree } = await buildEssential('', header.characterFrequencies)

    if (cmdArgs.mermaid) new MermaidGraph(tree).generate('mermaidgraphDecoding.md')

    const decodedText = parseBitsToText(decodedBits.slice(headerEndIndexBit), tree) || ''

    await $`rm -f ${cmdArgs.outputFileName}`
    await appendFile(cmdArgs.outputFileName, 'decodedText')
    await $`echo extracted ${formatBytes(header.originalFileSize)} of file size. `
  }
}

export const main = async (cmdArgs: any) => cmdArgs.encode ? compressionTool.encoding(cmdArgs) : compressionTool.decoding(cmdArgs)