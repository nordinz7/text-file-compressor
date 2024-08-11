// Read the text and determine the frequency of each character occurring.
// Build the binary tree from the frequencies.
// Generate the prefix-code table from the tree.
// Encode the text using the code table.
// Encode the tree - we’ll need to include this in the output file so we can decode it.
// Write the encoded tree and text to an output field

import { buildTree, getFreq, readTextFile, TreeChildNode } from "./utils"

const text = await readTextFile('/test.txt')

const freq: Record<string, number> = getFreq(text)

// console.dir(freq)

const sortedFreq = Object.entries(freq).sort((a,b)=> a[1] - b[1])

// console.dir(sortedFreq)

const nodes = sortedFreq.map(sf => new TreeChildNode(sf[0], sf[1]))

const tree = buildTree(nodes)
console.log('--------tree', JSON.stringify(tree))