import { Node, Token } from './types'

/**
 *  DirectedGraph implements exactly that
 */
export default class DirectedGraph<T extends Node> {
  private nodesByToken = new Map<Token, T>()
  private edgesByNode = new Map<Token, Set<Token>>()

  protected assertNodeExists(id: Token) {
    if (!this.nodesByToken.has(id)) {
      throw new Error(`Node "${id}" not present in graph`)
    }
  }

  addNode(n: T): Token {
    const { id } = n
    if (this.nodesByToken.has(id)) {
      throw new Error(`Node already exists "${id}"`)
    }

    this.nodesByToken.set(id, n)
    this.edgesByNode.set(id, new Set<Token>())

    return id
  }

  removeNode(id: Token): void {
    this.edgesByNode.delete(id)
    this.nodesByToken.delete(id)

    // Clean up edgesByNode referencing the deleted node. If removal becomes a
    // frequent operation, we could also just remove these.
    for (const [t, cs] of this.edgesByNode) {
      if (cs.has(id)) {
        cs.delete(id)
      }
    }
  }

  nodes(): Set<T> {
    return new Set(this.nodesByToken.values())
  }

  edges(): Set<[from: Token, to: Token]> {
    const edges = new Set<[from: Token, to: Token]>()
    for (const [n, cs] of this.edgesByNode) {
      for (const c of cs) {
        edges.add([n, c])
      }
    }

    return edges
  }

  has(t: Token): boolean {
    return this.nodesByToken.has(t)
  }

  getNode(t: Token): T {
    const n = this.nodesByToken.get(t)
    this.assertNodeExists(t)
    return n!
  }

  /**
   *  Add a single edge addEdgeing the two nodes.
   */
  addEdge(from: Token, to: Token): void {
    this.assertNodeExists(from)
    this.assertNodeExists(to)
    this.edgesByNode.get(from)!.add(to)
  }

  edgeExists(from: Token, to: Token): boolean {
    return this.edgesByNode.get(from)!.has(to)
  }

  /**
   *  Return the set of nodes added to `n`
   */
  edgesFrom(t: Token): Set<T> {
    this.assertNodeExists(t)
    const edgesFrom = new Set<T>()
    for (const c of this.edgesByNode.get(t)!) {
      edgesFrom.add(this.getNode(c))
    }

    return edgesFrom
  }

  /**
   * `iter` will be called for all nodes with edges connected to `node`
   */
  visit(t: Token, iter: (node: T) => void): void {
    const seen = new Set<Token>()
    const nodes = this.edgesFrom(t)

    for (const n of nodes) {
      iter(n)
      seen.add(n.id)

      for (const c of this.edgesFrom(n.id)) {
        if (!seen.has(c.id)) {
          nodes.add(c)
        }
      }
    }
  }
}
