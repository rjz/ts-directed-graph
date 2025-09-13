import DirectedGraph from './directedGraph'

import { Node, Token } from './types'

export class AcyclicViolationError<T> extends TypeError {}

/**
 *  DirectedAcyclicGraph implements a DAG, throwing on attempts to introduce
 *  cyclic relationships between nodes
 */
export default class DirectedAcyclicGraph<
  T extends Node,
  E = undefined,
> extends DirectedGraph<T, E> {
  /**
   *  Check for cyclic relationships
   */
  addEdge(from: Token, to: Token, label?: E, weight?: number) {
    this.visit(to, function (n) {
      if (n.id === from) {
        throw new AcyclicViolationError(
          `Nodes ${from} <=> ${n.id} violate acyclic constraint`,
        )
      }
    })

    super.addEdge(from, to, label, weight)
  }

  protected _populate(id: Token, graph: DirectedAcyclicGraph<T, E>) {
    const root = this.getNode(id)
    graph.addNode(root)

    const edges = this.getEdgesFrom(id)
    for (const [, to, label, weight] of edges) {
      this._populate(to, graph)
      graph.addEdge(root.id, to, label, weight)
    }

    return graph
  }

  /**
   *  Returns a new `DirectedAcyclicGraph` populated with the subgraph starting
   *  at `id`
   */
  subgraph(id: Token): DirectedAcyclicGraph<T, E> {
    const copy = new DirectedAcyclicGraph<T, E>()
    return this._populate(id, copy)
  }
}
