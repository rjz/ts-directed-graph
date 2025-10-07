import DirectedGraph from './directedGraph'
import { Token, Node } from './types'

export function toMermaid<T extends Node, E = undefined>(
  g: DirectedGraph<T, E>,
): string {
  const nodes = g.nodes()
  const edgesByNode = g.edges()

  const hasSomeEdge = new Set<Token>()

  let diagram = 'flowchart LR\n'

  for (const n of edgesByNode) {
    const [from, to, label, weight] = n
    hasSomeEdge.add(from)
    hasSomeEdge.add(to)

    let edgeLabel = ''
    if (label) {
      edgeLabel += label
    }

    if (typeof weight !== 'undefined') {
      edgeLabel += ` (${weight})`
    }

    if (edgeLabel) {
      diagram += `  ${from} -- ${edgeLabel.trim()} --> ${to}\n`
    } else {
      diagram += `  ${from} --> ${to}\n`
    }
  }

  for (const n of nodes) {
    if (!hasSomeEdge.has(n.id)) {
      diagram += `  ${n.id}\n`
    }
  }

  return diagram
}
