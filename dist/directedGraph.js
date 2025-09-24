"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _DirectedGraph_reverseEdgesByNode;
Object.defineProperty(exports, "__esModule", { value: true });
const noopEmitter = {
    emit() { },
};
/**
 *  DirectedGraph implements exactly that
 */
class DirectedGraph {
    constructor(opts) {
        var _a;
        this.nodesByToken = new Map();
        this.edgesByNode = new Map();
        _DirectedGraph_reverseEdgesByNode.set(this, new Map());
        this.emitter = (_a = opts === null || opts === void 0 ? void 0 : opts.emitter) !== null && _a !== void 0 ? _a : noopEmitter;
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
        __classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").set(id, new Set());
        this.edgesByNode.set(id, new Set());
        this.emitter.emit('node:added', n);
        return id;
    }
    _removeNode(id) {
        const node = this.getNode(id);
        for (const [from, to] of __classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").get(id)) {
            const s = this.edgesByNode.get(from);
            for (const edge of s) {
                if (edge[1] === to) {
                    s.delete(edge);
                    break;
                }
            }
        }
        for (const [from, to] of this.edgesByNode.get(id)) {
            const s = __classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").get(to);
            for (const edge of s) {
                if (edge[0] === from) {
                    s.delete(edge);
                    break;
                }
            }
        }
        this.edgesByNode.delete(id);
        this.nodesByToken.delete(id);
        __classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").delete(id);
        this.emitter.emit('node:removed', node);
    }
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
    removeNode(id, strategy = 'DEFAULT') {
        switch (strategy) {
            case 'DEFAULT':
                this._removeNode(id);
                break;
            case 'PRUNE':
                this._pruneNode(id);
                break;
            case 'COLLAPSE':
                this._collapseNode(id);
                break;
            default:
                const x = strategy;
                throw new Error(`Unknown deletion strategy '${x}'`);
        }
    }
    /**
     *  Removes the subject node, recursively pruning any subtrees detached in the
     *  removal process
     */
    _pruneNode(id) {
        const existingRoots = this.roots();
        const connectedTokens = Array.from(this.edgesByNode.get(id)).map(([, to]) => to);
        this._removeNode(id);
        for (const token of connectedTokens) {
            const isDetached = __classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").get(token).size === 0;
            if (!existingRoots.has(token) && isDetached) {
                this._pruneNode(token);
            }
        }
    }
    /**
     *  Removes the subject node, directly connecting any nodes previously
     *  connected through the subject
     */
    _collapseNode(id) {
        const outboundIds = Array.from(this.edgesByNode.get(id)).map(([, to]) => to);
        const inboundIds = Array.from(__classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").get(id)).map(([from]) => from);
        this._removeNode(id);
        for (const to of outboundIds) {
            for (const from of inboundIds) {
                this.addEdge(from, to);
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
        this.emitter.emit('node:replaced', node);
    }
    roots() {
        const roots = new Set();
        for (const [t, edges] of __classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").entries()) {
            if (edges.size === 0) {
                roots.add(t);
            }
        }
        return roots;
    }
    nodes() {
        return new Set(this.nodesByToken.values());
    }
    edges() {
        const edges = new Set();
        for (const es of this.edgesByNode.values()) {
            for (const e of es) {
                edges.add(e);
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
     *  Add a single edge connecting the two nodes.
     */
    addEdge(from, to, label, weight) {
        this.assertNodeExists(from);
        this.assertNodeExists(to);
        const edge = [from, to, label, weight];
        this.edgesByNode.get(from).add(edge);
        __classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").get(to).add(edge);
        this.emitter.emit('edge:added', edge);
    }
    edgeExists(from, to) {
        for (const edge of this.edgesByNode.get(from)) {
            if (edge[1] === to) {
                return true;
            }
        }
        return false;
    }
    /**
     *  Return the set of nodes that have a direct outbound edge from this node
     */
    outboundNodes(t) {
        this.assertNodeExists(t);
        const outboundNodes = new Set();
        for (const [, c] of this.edgesByNode.get(t)) {
            outboundNodes.add(this.getNode(c));
        }
        return outboundNodes;
    }
    outboundEdges(t) {
        this.assertNodeExists(t);
        return new Set(this.edgesByNode.get(t));
    }
    inboundEdges(t) {
        this.assertNodeExists(t);
        return new Set(__classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").get(t));
    }
    /**
     * `iter` will be called for all nodes with edges connected to `node`
     */
    visit(t, iter) {
        const seen = new Set();
        const nodes = this.outboundNodes(t);
        for (const n of nodes) {
            iter(n);
            seen.add(n.id);
            for (const c of this.outboundNodes(n.id)) {
                if (!seen.has(c.id)) {
                    nodes.add(c);
                }
            }
        }
    }
}
_DirectedGraph_reverseEdgesByNode = new WeakMap();
exports.default = DirectedGraph;
//# sourceMappingURL=directedGraph.js.map