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
}
