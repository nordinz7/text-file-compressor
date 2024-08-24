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

  static isTreeNode(obj: any): obj is TreeNode {
    return obj instanceof TreeNode || obj && obj.value !== undefined
  }

  static isTreeChildNode(obj: any): obj is TreeChildNode {
    return obj instanceof TreeChildNode || obj && obj.character !== undefined
  }
}

type MermaidGraphOpts = {
  graphDirection: 'TD' | 'LR' | 'BT' | 'RL'
}

enum NodeSide {
  left = 'left',
  right = 'right'
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

  buildGraph(node: TreeNode, previousNodeId: null | string = null, side: NodeSide | null = null) {
    const nodeId = this.generateNodeId()
    const rootNode = this.generateRootNode(node, side, nodeId)

    if (previousNodeId) {
      this.generatedGraphText.push(this.linkNode(previousNodeId, rootNode))
    } else {
      this.generatedGraphText.push(rootNode)
    }

    const rN = node.rightNode
    const lN = node.leftNode

    const nodes = [{ node: rN, side: NodeSide.right }, { node: lN, side: NodeSide.left }]

    nodes.forEach((n) => {
      if (TreeNode.isTreeChildNode(n.node)) {
        const nNode = this.generateChildNode(n.node, n.side)
        this.generatedGraphText.push(this.linkNode(nodeId, nNode))
      } else if (TreeNode.isTreeNode(n.node)) {
        this.buildGraph(n.node, nodeId, n.side)
      }
    })
  }


  generateRootNode(node: TreeNode, side: NodeSide | null = null, nodeId: string = this.generateNodeId()): string {
    const t = `${nodeId}((${node.value}))`
    return side ? `${this.generatePathText(side)} ${t}` : t
  }

  generateChildNode(node: TreeChildNode, side: NodeSide): string {
    return `${this.generatePathText(side)} ${this.generateNodeId()}["${this.sanitizeCharacter(node.character)} ${node.freq}"]`
  }

  generatePathText(side: NodeSide) {
    return `|${side === NodeSide.left ? 0 : 1}|`
  }

  sanitizeCharacter(character: string) {
    return character === '"' ? '""' : character
  }

  linkNode(rootNodeId: string, childNode: string) {
    return `${rootNodeId} --> ${childNode}`
  }
}