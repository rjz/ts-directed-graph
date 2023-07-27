"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
/**
 *  DirectedGraph implements exactly that
 */
class DirectedGraph {
    constructor() {
        this.nodesByToken = new Map();
        this.edgesByNode = new Map();
    }
    addNode(n) {
        const { id } = n;
        (0, assert_1.default)(!this.nodesByToken.has(id), `Node already exists "${n.id}"`);
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
        (0, assert_1.default)(n, `Node not found '${t}'`);
        return n;
    }
    /**
     *  Add a single edge addEdgeing the two nodes.
     */
    addEdge(from, to) {
        (0, assert_1.default)(this.has(from), `Node "${from}" not present in graph`);
        (0, assert_1.default)(this.has(to), `Node "${to}" not present in graph`);
        this.edgesByNode.get(from).add(to);
    }
    edgeExists(from, to) {
        return this.edgesByNode.get(from).has(to);
    }
    /**
     *  Return the set of nodes addEdgeed to `n`
     */
    edgesFrom(t) {
        (0, assert_1.default)(this.has(t), `Node "${t}" not present in graph`);
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