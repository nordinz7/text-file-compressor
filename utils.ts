export const readTextFile =async (path: string)=>!path ? '': Bun.file(__dirname + path).text()

export const getFreq = (text: string)=>text?.split('').reduce((acc, val) => {
  acc[val] = acc[val] ? acc[val] + 1 : 1
  return acc
}, {} as any)

export class TreeChildNode {
  public character: string
  public freq: number

  constructor(character: string, freq: number){
    this.character = character
    this.freq = freq
  }
}

export class TreeNode{
  public value: number;
  public rightNode: null | TreeNode | TreeChildNode
  public leftNode: null | TreeNode | TreeChildNode

  constructor(){
    this.value = 0
    this.rightNode = null
    this.leftNode = null
  }

  setRightNode(n: null | TreeNode | TreeChildNode){
    this.rightNode = n //@ts-ignore
    this.value += n?.value || n?.freq || 0
  }

  setLeftNode(n: null | TreeNode | TreeChildNode){
    this.leftNode = n //@ts-ignore
    this.value += n?.value || n?.freq || 0
  }
}

export const buildTree = (nodes: any[]): TreeNode=>{
  const sortedNodes = nodes.sort((a,b)=> (a?.value || a.freq )- (b?.value || b.freq))

  if (sortedNodes.length ===1 ) return sortedNodes[0]

  const [f,s] = sortedNodes.splice(0,2)
  const treeNode = new TreeNode()
  treeNode.setLeftNode(f)
  treeNode.setRightNode(s)

  sortedNodes.unshift(treeNode)

  return buildTree(sortedNodes)
}

// select two node smallest and add (node.value + node.freq)
// rearrange
// select tow node include one one but need to select value
