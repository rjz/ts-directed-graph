export type Token = string

export interface Node {
  id: Token
}

export function isNode(x: any): x is Node {
  return typeof x === 'object' && typeof x.id === 'string'
}

export type Edge = [from: Token, to: Token]
