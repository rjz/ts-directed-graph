import mocha from 'mocha'
import { assert } from 'chai'

import DirectedGraph from './directedGraph'

type TestNodeType = { id: string; value: number }

describe('DirectedGraph', function () {
  function setup() {
    const graph = new DirectedGraph<TestNodeType>()

    const n1 = graph.addNode({ id: 'N-1', value: 0 })
    const n2 = graph.addNode({ id: 'N-2', value: 0 })

    return { graph, n1, n2 }
  }

  it('.addEdge', function () {
    const { graph, n1, n2 } = setup()

    graph.addEdge(n1, n2)

    assert.ok(graph.getNode('N-1'), 'node not found')
    assert.equal(1, graph.edgesFrom('N-1').size, 'missing edge from N-1')
    assert.equal(0, graph.edgesFrom('N-2').size, 'missing edge from N-1')
  })

  it('.replaceNode', function () {
    const { graph, n1, n2 } = setup()
    graph.replaceNode({ id: 'N-1', value: 1 })
    assert.equal(graph.getNode('N-1').value, 1)
  })

  it('.removeNode', function () {
    const { graph, n1, n2 } = setup()

    graph.addEdge(n1, n2)

    graph.removeNode(n2)

    assert.throws(() => graph.getNode('N-2'), 'Node "N-2" not present in graph')
    assert.equal(
      0,
      graph.edgesFrom('N-1').size,
      'unexpected addEdgeion from N-1',
    )
  })
})
