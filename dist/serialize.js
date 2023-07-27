"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMermaid = void 0;
function toMermaid(g) {
    const nodes = g.nodes();
    const edgesByNode = g.edges();
    const hasSomeEdge = new Set();
    let diagram = 'flowchart LR\n';
    for (const n of edgesByNode) {
        const [from, to] = n;
        hasSomeEdge.add(from);
        hasSomeEdge.add(to);
        diagram += `  ${from} --> ${to}\n`;
    }
    for (const n of nodes) {
        if (!hasSomeEdge.has(n.id)) {
            diagram += `  ${n.id}\n`;
        }
    }
    return diagram;
}
exports.toMermaid = toMermaid;
//# sourceMappingURL=serialize.js.map