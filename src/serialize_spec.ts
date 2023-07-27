import mocha from 'mocha'
import { assert } from 'chai'

import DirectedGraph from './directedGraph'
import { toMermaid } from './serialize'

type TestNodeType = { id: string }

describe('Serialize', function () {
  describe('.toMermaid', function () {
    it('handles a simple graph OK', function () {
      const graph = new DirectedGraph<TestNodeType>()

      const n1 = graph.addNode({ id: 'N-1' })
      const n2 = graph.addNode({ id: 'N-2' })
      const n3 = graph.addNode({ id: 'N-3' })
      const n4 = graph.addNode({ id: 'N-4' })
      const n5 = graph.addNode({ id: 'N-5' })

      graph.addEdge('N-1', 'N-2')
      graph.addEdge('N-2', 'N-3')
      graph.addEdge('N-2', 'N-4')
      graph.addEdge('N-3', 'N-4')
      graph.addEdge('N-1', 'N-4')

      const actual = toMermaid(graph)
      assert.deepEqual(
        actual.split('\n'),
        `flowchart LR
  N-1 --> N-2
  N-1 --> N-4
  N-2 --> N-3
  N-2 --> N-4
  N-3 --> N-4
  N-5
`.split('\n'),
      )
    })
  })
})
