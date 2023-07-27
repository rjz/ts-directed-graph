Graph
==============================================================================

Basic graph implementations as building blocks for better things.

Test
-------------------------------------------------------------------------------

```bash
$ npm i
$ npm test
```

Usage
-------------------------------------------------------------------------------

### `DirectedGraph`

```ts
import * as G from 'ts-directed-graph'

const graph = new G.DirectedGraph<G.Node>()

const n1 = graph.addNode({ id: 'N-1' })
const n2 = graph.addNode({ id: 'N-2' })
const n3 = graph.addNode({ id: 'N-3' })

graph.addEdge('N-1', 'N-2')
graph.addEdge('N-2', 'N-3')
```

### `DirectedAcyclicGraph`

See [`DirectedGraph`](#DirectedGraph), but expect an `AcyclicViolationError`
when attempting to introduce a cyclic relationship between nodes

### `Serialize`

`ts-directed-graph` includes a basic [Mermaid][mermaid] serializer to help
[visualize and debug graphs][mermaid-live]

```ts
import { Serialize } from 'ts-directed-graph'

const actual = Serialize.toMermaid(graph)
```

License
-------------------------------------------------------------------------------

ISC

[mermaid]: https://mermaid.js.org/
[mermaid-live]: https://mermaid.live/
