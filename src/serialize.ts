import DirectedGraph from './directedGraph'
import { Token, Node } from './types'

export function toMermaid<T extends Node>(g: DirectedGraph<T>): string {
  const nodes = g.nodes()
  const edgesByNode = g.edges()

  const hasSomeEdge = new Set<Token>()

  let diagram = 'flowchart LR\n'

  for (const n of edgesByNode) {
    const [from, to] = n
    hasSomeEdge.add(from)
    hasSomeEdge.add(to)
    diagram += `  ${from} --> ${to}\n`
  }

  for (const n of nodes) {
    if (!hasSomeEdge.has(n.id)) {
      diagram += `  ${n.id}\n`
    }
  }

  return diagram
}
