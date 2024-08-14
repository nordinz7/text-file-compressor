
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
  public rootNode
  public opts

  constructor(node: TreeNode, opts: MermaidGraphOpts = { graphDirection: 'TD' }) {
    this.uniqueIdGenerationCount = 0
    this.alphaCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    this.rootNode = node
    this.opts = opts
  }

  generate() {
    const header = `graph ${this.opts.graphDirection};`
    const tree = this.generateTreeNode(this.rootNode)

    return `
    :::mermaid
      ${header}
      ${tree}
    :::
    `.split('\n').reduce((acc, line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine.length || trimmedLine === ';') return acc

      acc.push(trimmedLine)
      return acc
    }, [] as string[]).join('\n')
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

  generateTreeNode(node: TreeNode): string {
    const rootNodeId = this.generateNodeId()

    return `
      ${rootNodeId}((${node.value})) --> ${this.generateTreeChildNode(node.leftNode)};
      ${rootNodeId} --> ${this.generateTreeChildNode(node.rightNode)};
    `
  }

  generateTreeChildNode(node: TreeChildNode | TreeNode | null): string {
    if (!node) return ''

    if (node instanceof TreeNode) return this.generateTreeNode(node)

    return `${this.generateNodeId()}["${node.character}" ${node.freq}]`
  }
}