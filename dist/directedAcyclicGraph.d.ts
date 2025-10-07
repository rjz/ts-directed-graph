import DirectedGraph from './directedGraph';
import { Node, Token } from './types';
export declare class AcyclicViolationError<T> extends TypeError {
}
/**
 *  DirectedAcyclicGraph implements a DAG, throwing on attempts to introduce
 *  cyclic relationships between nodes
 */
export default class DirectedAcyclicGraph<T extends Node, E = undefined> extends DirectedGraph<T, E> {
    /**
     *  Check for cyclic relationships
     */
    addEdge(from: Token, to: Token, label?: E, weight?: number): void;
    protected _populate(id: Token, graph: DirectedAcyclicGraph<T, E>): DirectedAcyclicGraph<T, E>;
    /**
     *  Returns a new `DirectedAcyclicGraph` populated with the subgraph starting
     *  at `id`
     */
    subgraph(id: Token): DirectedAcyclicGraph<T, E>;
}
