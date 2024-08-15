import { $ } from "bun"
import { appendFile } from "node:fs/promises";

export class TreeChildNode {
  public character: string
  public freq: number

  constructor(character: string, freq: number) {
    this.character = character
    this.freq = freq
  }
}

export class TreeNode {
  public value: number;
  public rightNode: null | TreeNode | TreeChildNode
  public leftNode: null | TreeNode | TreeChildNode

  constructor() {
    this.value = 0
    this.rightNode = null
    this.leftNode = null
  }

  setRightNode(n: null | TreeNode | TreeChildNode) {
    this.rightNode = n //@ts-ignore
    this.value += n?.value || n?.freq || 0
  }

  setLeftNode(n: null | TreeNode | TreeChildNode) {
    this.leftNode = n //@ts-ignore
    this.value += n?.value || n?.freq || 0
  }
}

type MermaidGraphOpts = {
  graphDirection: 'TD' | 'LR' | 'BT' | 'RL'
}

export class MermaidGraph {
  public uniqueIdGenerationCount
  public alphaCharacters
  public initialNode
  public opts
  public generatedGraphText: string[]
  public output

  constructor(node: TreeNode, opts: MermaidGraphOpts = { graphDirection: 'TD' }) {
    this.uniqueIdGenerationCount = 0
    this.alphaCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    this.initialNode = node
    this.opts = opts
    this.generatedGraphText = []
    this.output = ''
  }

  async generate(fileName: string = 'mermaidgraph.md') {
    this.buildGraph(this.initialNode)
    this.wrapWithHeader()

    await $`rm -f  ${fileName}`
    await appendFile(fileName, this.output)
  }

  wrapWithHeader() {
    const header = `graph ${this.opts.graphDirection};`
    this.output = [':::mermaid', header, ...this.generatedGraphText, ':::'].join('\n')
  }

  generateNodeId() {
    let id = ''
    let count = this.uniqueIdGenerationCount

    while (count >= 0) {
      id = this.alphaCharacters[count % 26] + id
      count = Math.floor(count / 26) - 1
    }

    this.uniqueIdGenerationCount++
    return id
  }

  buildGraph(node: TreeNode, previousNodeId: null | string = null) {
    const nodeId = this.generateNodeId()
    const rootNode = this.generateRootNode(node, nodeId)

    if (previousNodeId) {
      this.generatedGraphText.push(this.linkNode(previousNodeId, rootNode))
    } else {
      this.generatedGraphText.push(rootNode)
    }

    const rN = node.rightNode
    const lN = node.leftNode

    const nodes = [rN, lN]

    nodes.forEach((n) => {

      if (n instanceof TreeChildNode) {
        const nNode = this.generateChildNode(n)
        this.generatedGraphText.push(this.linkNode(nodeId, nNode))
      } else if (n instanceof TreeNode) {
        this.buildGraph(n, nodeId)
      }
    })
  }


  generateRootNode(node: TreeNode, nodeId: string = this.generateNodeId()): string {
    return `${nodeId}((${node.value}))`
  }

  generateChildNode(node: TreeChildNode): string {
    return `${this.generateNodeId()}["${this.sanitizeCharacter(node.character)} ${node.freq}"]`
  }

  sanitizeCharacter(character: string) {
    return character === '"' ? '""' : character
  }

  linkNode(rootNodeId: string, childNode: string) {
    return `${rootNodeId} --> ${childNode}`
  }
}