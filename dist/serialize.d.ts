import DirectedGraph from './directedGraph';
import { Node } from './types';
export declare function toMermaid<T extends Node>(g: DirectedGraph<T>): string;
