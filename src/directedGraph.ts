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
  #reverseEdgesByNode = new Map<Token, Set<Token>>()

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
    this.#reverseEdgesByNode.set(id, new Set<Token>())
    this.edgesByNode.set(id, new Set<Token>())
    this.emitter.emit('node:added', n)

    return id
  }

  protected _removeNode(id: Token): void {
    const node = this.getNode(id)

    for (const t of this.#reverseEdgesByNode.get(id)!) {
      this.edgesByNode.get(t)!.delete(id)
    }

    for (const t of this.edgesByNode.get(id)!) {
      this.#reverseEdgesByNode.get(t)!.delete(id)
    }

    this.edgesByNode.delete(id)
    this.nodesByToken.delete(id)
    this.#reverseEdgesByNode.delete(id)

    this.emitter.emit('node:removed', node)
  }

  /**
   *  Remove the subject node and any directly-connected edges
   *
   *  @param id - the ID of the node to be removed
   *  @param strategy - The strategy to use when considering connected nodes.
   *          One of:
   *
   *         - `'DEFAULT'` - the subject node's edges will be removed with no
   *           further action. This may result in previously-connected nodes
   *           being detached from the graph (effectively making them new "root"
   *           notes)
   *
   *         - `'PRUNE'` - the subject node's edges will be removed, and any
   *           newly-detached nodes removed from the graph
   *
   *         - `'COLLAPSE'` - the subject node's outbound edges will be
   *           connected to any inbound nodes
   *
   *         If no strategy is specified, `'DEFAULT'` will be used.
   */
  removeNode(
    id: Token,
    strategy: 'DEFAULT' | 'PRUNE' | 'COLLAPSE' = 'DEFAULT',
  ): void {
    switch (strategy) {
      case 'DEFAULT':
        this._removeNode(id)
        break
      case 'PRUNE':
        this._pruneNode(id)
        break
      case 'COLLAPSE':
        this._collapseNode(id)
        break
      default:
        const x: never = strategy
        throw new Error(`Unknown deletion strategy '${x}'`)
    }
  }

  /**
   *  Removes the subject node, recursively pruning any subtrees detached in the
   *  removal process
   */
  protected _pruneNode(id: Token): void {
    const existingRoots = this.roots()
    const connectedTokens = Array.from(this.edgesByNode.get(id)!)
    this.removeNode(id)

    for (const token of connectedTokens) {
      const isDetached = this.#reverseEdgesByNode.get(token)!.size === 0
      if (!existingRoots.has(token) && isDetached) {
        this._pruneNode(token)
      }
    }
  }

  /**
   *  Removes the subject node, directly connecting any nodes previously
   *  connected through the subject
   */
  protected _collapseNode(id: Token): void {
    const outboundIds = Array.from(this.edgesByNode.get(id)!)
    const inboundIds = Array.from(this.#reverseEdgesByNode.get(id)!)

    this.removeNode(id)

    for (const to of outboundIds) {
      for (const from of inboundIds) {
        this.addEdge(from, to)
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
    const roots = new Set<Token>()
    for (const [t, edges] of this.#reverseEdgesByNode.entries()) {
      if (edges.size === 0) {
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
    this.#reverseEdgesByNode.get(to)!.add(from)
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
