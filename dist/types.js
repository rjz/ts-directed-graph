"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNode = void 0;
function isNode(x) {
    return typeof x === 'object' && typeof x.id === 'string';
}
exports.isNode = isNode;
//# sourceMappingURL=types.js.map