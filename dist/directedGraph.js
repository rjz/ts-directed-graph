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
        for (const t of __classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").get(id)) {
            this.edgesByNode.get(t).delete(id);
        }
        for (const t of this.edgesByNode.get(id)) {
            __classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").get(t).delete(id);
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
        const connectedTokens = Array.from(this.edgesByNode.get(id));
        this.removeNode(id);
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
        const outboundIds = Array.from(this.edgesByNode.get(id));
        const inboundIds = Array.from(__classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").get(id));
        this.removeNode(id);
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
     *  Add a single edge connecting the two nodes.
     */
    addEdge(from, to) {
        this.assertNodeExists(from);
        this.assertNodeExists(to);
        this.edgesByNode.get(from).add(to);
        __classPrivateFieldGet(this, _DirectedGraph_reverseEdgesByNode, "f").get(to).add(from);
        this.emitter.emit('edge:added', [from, to]);
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
_DirectedGraph_reverseEdgesByNode = new WeakMap();
exports.default = DirectedGraph;
//# sourceMappingURL=directedGraph.js.map