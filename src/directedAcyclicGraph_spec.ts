import mocha from 'mocha'
import { assert } from 'chai'

import DirectedAcyclicGraph, {
  AcyclicViolationError,
} from './directedAcyclicGraph'

type TestNodeType = { id: string }

describe('DirectedAcyclicGraph', function () {
  it('throws AcyclicViolationError on invalid edge', function () {
    const graph = new DirectedAcyclicGraph<TestNodeType>()

    const n1 = { id: 'N-1' }
    const n2 = { id: 'N-2' }
    const n3 = { id: 'N-3' }

    graph.addNode(n1)
    graph.addNode(n2)
    graph.addNode(n3)

    graph.addEdge(n1.id, n2.id)
    graph.addEdge(n2.id, n3.id)

    assert.throws(() => graph.addEdge(n3.id, n1.id), AcyclicViolationError)
  })

  describe('.subgraph', function () {
    const graph = new DirectedAcyclicGraph<TestNodeType>()
    const Nodes = {
      n1: graph.addNode({ id: 'N-1' }),
      n2: graph.addNode({ id: 'N-2' }),
      n3: graph.addNode({ id: 'N-3' }),
      n4: graph.addNode({ id: 'N-4' }),
      n5: graph.addNode({ id: 'N-5' }),
      n6: graph.addNode({ id: 'N-6' }),
    }

    graph.addEdge(Nodes.n1, Nodes.n2)
    graph.addEdge(Nodes.n1, Nodes.n3)
    graph.addEdge(Nodes.n1, Nodes.n4)
    graph.addEdge(Nodes.n4, Nodes.n5)
    graph.addEdge(Nodes.n4, Nodes.n6)

    it('returns expected subgraph', function () {
      const sg = graph.subgraph(Nodes.n4)

      const nodes = Array.from(sg.nodes())
      assert.deepEqual(nodes, [{ id: 'N-4' }, { id: 'N-5' }, { id: 'N-6' }])

      const edges = Array.from(sg.edges())
      assert.deepEqual(edges, [
        ['N-4', 'N-5'],
        ['N-4', 'N-6'],
      ])
    })
  })
})
