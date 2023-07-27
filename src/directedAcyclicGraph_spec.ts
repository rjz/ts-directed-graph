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
})
