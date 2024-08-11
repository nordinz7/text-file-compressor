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

export const generateTable = (node: any, table:any={}, path =''):Record<string, string>=>{
  const rN = node.rightNode
  const lN = node.leftNode

  if (rN){
    path += '1'
    if (rN?.character){
      table[rN?.character] = path
    } else {
      generateTable(rN, table, path)
    }
  }

  if (lN){
    path += '0'
    if (lN?.character){
      table[lN?.character]=path
    } else {
      generateTable(lN, table,path)
    }
  }

  return table
}

export const encodeText = (text: string, table: Record<string, string>)=>{
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
