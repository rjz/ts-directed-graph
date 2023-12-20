import { Node, Edge, Token } from './types';
interface Emitter {
    emit(eventName: string | Symbol, ...args: any[]): void;
}
export interface DirectedGraphOptions {
    /**
     *  An (optional) event emitter. If injected, the `DirectedGraph` will emit
     *  events as graph data are modified.
     */
    emitter?: Emitter;
}
/**
 *  DirectedGraph implements exactly that
 */
export default class DirectedGraph<T extends Node> {
    #private;
    private nodesByToken;
    private edgesByNode;
    protected emitter: Emitter;
    constructor(opts?: DirectedGraphOptions);
    protected assertNodeExists(id: Token): void;
    addNode(n: T): Token;
    protected _removeNode(id: Token): void;
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
    removeNode(id: Token, strategy?: 'DEFAULT' | 'PRUNE' | 'COLLAPSE'): void;
    /**
     *  Removes the subject node, recursively pruning any subtrees detached in the
     *  removal process
     */
    protected _pruneNode(id: Token): void;
    /**
     *  Removes the subject node, directly connecting any nodes previously
     *  connected through the subject
     */
    protected _collapseNode(id: Token): void;
    /**
     *  Replace the node identified by `node.id` in situ, preserving any
     *  connected edges. Note that it's up to the user to ensure compatibility
     *  between the existing node and its replacement
     */
    replaceNode(node: T): void;
    roots(): Set<Token>;
    nodes(): Set<T>;
    edges(): Set<Edge>;
    has(t: Token): boolean;
    getNode(t: Token): T;
    /**
     *  Add a single edge connecting the two nodes.
     */
    addEdge(from: Token, to: Token): void;
    edgeExists(from: Token, to: Token): boolean;
    /**
     *  Return the set of nodes added to `n`
     */
    edgesFrom(t: Token): Set<T>;
    /**
     * `iter` will be called for all nodes with edges connected to `node`
     */
    visit(t: Token, iter: (node: T) => void): void;
}
export {};
