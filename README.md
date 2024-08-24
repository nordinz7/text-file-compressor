# text-file-compressor

A simple text compressor that uses the Huffman algorithm to compress and decompress text file.

this project depends on the bun runtime, you can install it from
[https://bun.sh](https://bun.sh)

```bash
curl -fsSL https://bun.sh/install | bash
```

if you have bun installed you can run the following commands to install and run the project:

```bash
bun install
```

# Usage

```bash
bun index.ts <encode|decode> <input file> [options]
```

or using script command

```
dev -- <encode|decode> <input file> [options]
```

## Options

- `-e, --encode <string>`: Specify the input file to encode.
- `-d, --decode <string>`: Specify the input file to decode.
- `-o, --outputFileName <string>`: Specify the output file name.
- `-m, --mermaid`: Enable Mermaid diagram generation for the Huffman tree.

This project was created using `bun init` in bun v1.1.18. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### Sample of mermaid diagram:

```mermaid
graph TD;
A((16))
A --> |1| B((10))
B --> |1| C((6))
C --> |1| D["d 3"]
C --> |0| E["r 3"]
B --> |0| F((4))
F --> |1| G["o 3"]
F --> |0| H["i 1"]
A --> |0| I["n 6"]
```

To view on vscode you can use the [Mermaid Preview](https://marketplace.visualstudio.com/items?itemName=vstirbu.vscode-mermaid-preview) extension.
