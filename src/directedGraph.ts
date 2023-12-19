import { Node, Edge, Token } from './types'

interface Emitter {
  emit(eventName: string | Symbol, ...args: any[]): void
}

const noopEmitter: Emitter = {
  emit() {},
}

export interface DirectedGraphOptions {
  /**
   *  An (optional) event emitter. If injected, the `DirectedGraph` will emit
   *  events as graph data are modified.
   */
  emitter?: Emitter
}

/**
 *  DirectedGraph implements exactly that
 */
export default class DirectedGraph<T extends Node> {
  private nodesByToken = new Map<Token, T>()
  private edgesByNode = new Map<Token, Set<Token>>()

  protected emitter: Emitter

  constructor(opts?: DirectedGraphOptions) {
    this.emitter = opts?.emitter ?? noopEmitter
  }

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
    this.emitter.emit('node:added', n)

    return id
  }

  removeNode(id: Token): void {
    const node = this.getNode(id)

    this.edgesByNode.delete(id)
    this.nodesByToken.delete(id)

    // Clean up edgesByNode referencing the deleted node. If removal becomes a
    // frequent operation, we could also just remove these.
    for (const [t, cs] of this.edgesByNode) {
      if (cs.has(id)) {
        cs.delete(id)
      }
    }

    this.emitter.emit('node:removed', node)
  }

  /**
   *  Removes the subject node, recursively pruning any subtrees detached in the
   *  removal process
   */
  pruneNode(id: Token): void {
    const roots = this.roots()
    this.removeNode(id)

    const newRoots = this.roots()
    for (const token of newRoots.values()) {
      if (!roots.has(token)) {
        this.pruneNode(token)
      }
    }
  }

  /**
   *  Replace the node identified by `node.id` in situ, preserving any
   *  connected edges. Note that it's up to the user to ensure compatibility
   *  between the existing node and its replacement
   */
  replaceNode(node: T): void {
    this.assertNodeExists(node.id)
    this.nodesByToken.set(node.id, node)

    this.emitter.emit('node:replaced', node)
  }

  roots(): Set<Token> {
    // TODO: consider maintaining a bidirectional edgeset to trade datastructure
    // complexity for an O(1) lookup here
    const tokensWithEdges = new Set<Token>()
    for (const tokens of this.edgesByNode.values()) {
      for (const t of tokens) {
        tokensWithEdges.add(t)
      }
    }

    const roots = new Set<Token>()
    for (const t of this.nodesByToken.keys()) {
      if (!tokensWithEdges.has(t)) {
        roots.add(t)
      }
    }

    return roots
  }

  nodes(): Set<T> {
    return new Set(this.nodesByToken.values())
  }

  edges(): Set<Edge> {
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
   *  Add a single edge connecting the two nodes.
   */
  addEdge(from: Token, to: Token): void {
    this.assertNodeExists(from)
    this.assertNodeExists(to)
    this.edgesByNode.get(from)!.add(to)
    this.emitter.emit('edge:added', [from, to])
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
