import { Contract } from '@algorandfoundation/algorand-typescript'

export class SmartContract extends Contract {
  hello(name: string): string {
    return `Hello, ${name}`
  }
}
