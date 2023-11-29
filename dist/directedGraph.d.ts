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
    private nodesByToken;
    private edgesByNode;
    protected emitter: Emitter;
    constructor(opts?: DirectedGraphOptions);
    protected assertNodeExists(id: Token): void;
    addNode(n: T): Token;
    removeNode(id: Token): void;
    /**
     *  Replace the node identified by `node.id` in situ, preserving any
     *  connected edges. Note that it's up to the user to ensure compatibility
     *  between the existing node and its replacement
     */
    replaceNode(node: T): void;
    nodes(): Set<T>;
    edges(): Set<Edge>;
    has(t: Token): boolean;
    getNode(t: Token): T;
    /**
     *  Add a single edge addEdgeing the two nodes.
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
