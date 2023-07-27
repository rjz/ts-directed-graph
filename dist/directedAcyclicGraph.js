"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcyclicViolationError = void 0;
const directedGraph_1 = __importDefault(require("./directedGraph"));
class AcyclicViolationError extends TypeError {
}
exports.AcyclicViolationError = AcyclicViolationError;
/**
 *  DirectedAcyclicGraph implements a DAG, throwing on attempts to introduce
 *  cyclic relationships between nodes
 */
class DirectedAcyclicGraph extends directedGraph_1.default {
    /**
     *  Check for cyclic relationships
     */
    addEdge(from, to) {
        this.visit(to, function (n) {
            if (n.id === from) {
                throw new AcyclicViolationError(`Nodes ${from} <=> ${n.id} violate acyclic constraint`);
            }
        });
        super.addEdge(from, to);
    }
}
exports.default = DirectedAcyclicGraph;
//# sourceMappingURL=directedAcyclicGraph.js.map