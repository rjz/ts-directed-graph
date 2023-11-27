"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  DirectedGraph implements exactly that
 */
class DirectedGraph {
    constructor() {
        this.nodesByToken = new Map();
        this.edgesByNode = new Map();
    }
    assertNodeExists(id) {
        if (!this.nodesByToken.has(id)) {
            throw new Error(`Node "${id}" not present in graph`);
        }
    }
    addNode(n) {
        const { id } = n;
        if (this.nodesByToken.has(id)) {
            throw new Error(`Node already exists "${id}"`);
        }
        this.nodesByToken.set(id, n);
        this.edgesByNode.set(id, new Set());
        return id;
    }
    removeNode(id) {
        this.edgesByNode.delete(id);
        this.nodesByToken.delete(id);
        // Clean up edgesByNode referencing the deleted node. If removal becomes a
        // frequent operation, we could also just remove these.
        for (const [t, cs] of this.edgesByNode) {
            if (cs.has(id)) {
                cs.delete(id);
            }
        }
    }
    /**
     *  Replace the node identified by `node.id` in situ, preserving any
     *  connected edges. Note that it's up to the user to ensure compatibility
     *  between the existing node and its replacement
     */
    replaceNode(node) {
        this.assertNodeExists(node.id);
        this.nodesByToken.set(node.id, node);
    }
    nodes() {
        return new Set(this.nodesByToken.values());
    }
    edges() {
        const edges = new Set();
        for (const [n, cs] of this.edgesByNode) {
            for (const c of cs) {
                edges.add([n, c]);
            }
        }
        return edges;
    }
    has(t) {
        return this.nodesByToken.has(t);
    }
    getNode(t) {
        const n = this.nodesByToken.get(t);
        this.assertNodeExists(t);
        return n;
    }
    /**
     *  Add a single edge addEdgeing the two nodes.
     */
    addEdge(from, to) {
        this.assertNodeExists(from);
        this.assertNodeExists(to);
        this.edgesByNode.get(from).add(to);
    }
    edgeExists(from, to) {
        return this.edgesByNode.get(from).has(to);
    }
    /**
     *  Return the set of nodes added to `n`
     */
    edgesFrom(t) {
        this.assertNodeExists(t);
        const edgesFrom = new Set();
        for (const c of this.edgesByNode.get(t)) {
            edgesFrom.add(this.getNode(c));
        }
        return edgesFrom;
    }
    /**
     * `iter` will be called for all nodes with edges connected to `node`
     */
    visit(t, iter) {
        const seen = new Set();
        const nodes = this.edgesFrom(t);
        for (const n of nodes) {
            iter(n);
            seen.add(n.id);
            for (const c of this.edgesFrom(n.id)) {
                if (!seen.has(c.id)) {
                    nodes.add(c);
                }
            }
        }
    }
}
exports.default = DirectedGraph;
//# sourceMappingURL=directedGraph.js.map