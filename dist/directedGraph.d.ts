import { Node, Token } from './types';
/**
 *  DirectedGraph implements exactly that
 */
export default class DirectedGraph<T extends Node> {
    private nodesByToken;
    private edgesByNode;
    addNode(n: T): Token;
    removeNode(id: Token): void;
    nodes(): Set<T>;
    edges(): Set<[from: Token, to: Token]>;
    has(t: Token): boolean;
    getNode(t: Token): T;
    /**
     *  Add a single edge addEdgeing the two nodes.
     */
    addEdge(from: Token, to: Token): void;
    edgeExists(from: Token, to: Token): boolean;
    /**
     *  Return the set of nodes addEdgeed to `n`
     */
    edgesFrom(t: Token): Set<T>;
    /**
     * `iter` will be called for all nodes with edges connected to `node`
     */
    visit(t: Token, iter: (node: T) => void): void;
}
