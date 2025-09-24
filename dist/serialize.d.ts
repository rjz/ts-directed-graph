import DirectedGraph from './directedGraph';
import { Node } from './types';
export declare function toMermaid<T extends Node, E = undefined>(g: DirectedGraph<T, E>): string;
