export type Token = string;
export interface Node {
    id: Token;
}
export declare function isNode(x: any): x is Node;
export type Edge = [from: Token, to: Token];
