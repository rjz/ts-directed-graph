"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNode = exports.Serialize = exports.DirectedAcyclicGraph = exports.DirectedGraph = void 0;
var directedGraph_1 = require("./directedGraph");
Object.defineProperty(exports, "DirectedGraph", { enumerable: true, get: function () { return __importDefault(directedGraph_1).default; } });
var directedAcyclicGraph_1 = require("./directedAcyclicGraph");
Object.defineProperty(exports, "DirectedAcyclicGraph", { enumerable: true, get: function () { return __importDefault(directedAcyclicGraph_1).default; } });
exports.Serialize = __importStar(require("./serialize"));
var types_1 = require("./types");
Object.defineProperty(exports, "isNode", { enumerable: true, get: function () { return types_1.isNode; } });
//# sourceMappingURL=index.js.map