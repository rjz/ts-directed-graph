import DirectedGraph from './directedGraph'

import { Node, Token } from './types'

export class AcyclicViolationError<T> extends TypeError {}

/**
 *  DirectedAcyclicGraph implements a DAG, throwing on attempts to introduce
 *  cyclic relationships between nodes
 */
export default class DirectedAcyclicGraph<
  T extends Node,
> extends DirectedGraph<T> {
  /**
   *  Check for cyclic relationships
   */
  addEdge(from: Token, to: Token) {
    this.visit(to, function (n) {
      if (n.id === from) {
        throw new AcyclicViolationError(
          `Nodes ${from} <=> ${n.id} violate acyclic constraint`,
        )
      }
    })

    super.addEdge(from, to)
  }

  protected _populate(id: Token, graph: DirectedAcyclicGraph<T>) {
    const root = this.getNode(id)
    graph.addNode(root)

    const nodes = this.edgesFrom(id)
    for (const n of nodes) {
      this._populate(n.id, graph)
      graph.addEdge(root.id, n.id)
    }

    return graph
  }

  /**
   *  Returns a new `DirectedAcyclicGraph` populated with the subgraph starting
   *  at `id`
   */
  subgraph(id: Token): DirectedAcyclicGraph<T> {
    const copy = new DirectedAcyclicGraph<T>()
    return this._populate(id, copy)
  }
}
