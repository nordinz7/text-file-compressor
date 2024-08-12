import { parseArgs } from "util"
import { main } from "./utils";

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
  values.outputFileName =  values.encode ? '_compressed.txt' : '_extracted.txt'
}

await main(values)

