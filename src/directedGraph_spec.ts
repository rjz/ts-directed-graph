import EventEmitter from 'node:events'
import mocha from 'mocha'
import { assert } from 'chai'

import DirectedGraph from './directedGraph'

type TestNodeType = { id: string; value: number }

function expectEvent(
  emitter: EventEmitter,
  eventName: string,
  cb?: (...args: any[]) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    emitter.on(eventName, (...args: any[]) => {
      if (cb) {
        cb(...args)
      }
      resolve()
    })
  })
}

describe('DirectedGraph', function () {
  function setup(emitter?: EventEmitter) {
    const graph = new DirectedGraph<TestNodeType>({ emitter })

    const n1 = graph.addNode({ id: 'N-1', value: 0 })
    const n2 = graph.addNode({ id: 'N-2', value: 0 })

    return { graph, n1, n2, emitter }
  }

  describe('.addNode', function () {
    it('emits "node:added" event', function () {
      const emitter = new EventEmitter()
      const { graph } = setup(emitter)
      const p = expectEvent(emitter, 'node:added', (n) =>
        assert.equal(n.id, 'N-3'),
      )

      graph.addNode({ id: 'N-3', value: 0 })

      return p
    })
  })

  describe('.addEdge', function () {
    it('adds an edge', function () {
      const { graph, n1, n2 } = setup()

      graph.addEdge(n1, n2)

      assert.ok(graph.getNode('N-1'), 'node not found')
      assert.equal(1, graph.edgesFrom('N-1').size, 'missing edge from N-1')
      assert.equal(0, graph.edgesFrom('N-2').size, 'missing edge from N-1')
    })

    it('emits "edge:added" event', function () {
      const emitter = new EventEmitter()
      const { graph, n1, n2 } = setup(emitter)

      const p = expectEvent(emitter, 'edge:added', (e) =>
        assert.deepEqual(e, ['N-1', 'N-2']),
      )

      graph.addEdge(n1, n2)

      return p
    })
  })

  describe('.replaceNode', function () {
    it('replaces the node', function () {
      const { graph, n1, n2 } = setup()
      graph.replaceNode({ id: 'N-1', value: 1 })
      assert.equal(graph.getNode('N-1').value, 1)
    })

    it('emits "node:replaced" event', function () {
      const emitter = new EventEmitter()
      const { graph } = setup(emitter)
      const p = expectEvent(emitter, 'node:replaced', (n) =>
        assert.deepEqual(n, { id: 'N-1', value: 1 }),
      )

      graph.replaceNode({ id: 'N-1', value: 1 })

      return p
    })
  })

  describe('.removeNode', function () {
    it('removes the node', function () {
      const { graph, n1, n2 } = setup()

      graph.addEdge(n1, n2)

      graph.removeNode(n2)

      assert.throws(
        () => graph.getNode('N-2'),
        'Node "N-2" not present in graph',
      )
      assert.equal(
        0,
        graph.edgesFrom('N-1').size,
        'unexpected addEdgeion from N-1',
      )
    })

    it('emits "node:removed" event', function () {
      const emitter = new EventEmitter()
      const { graph, n2 } = setup(emitter)
      const p = expectEvent(emitter, 'node:removed', (n) =>
        assert.deepEqual(n, { id: 'N-2', value: 0 }),
      )

      graph.removeNode(n2)

      return p
    })
  })

  describe('.roots', function () {
    it('returns nodes without inbound edges', function () {
      const { graph, n1, n2 } = setup()

      graph.addEdge(n1, n2)

      const rootTokens = Array.from(graph.roots())
      assert.deepEqual(rootTokens, [n1])
    })
  })

  describe('.pruneNode', function () {
    it('prunes cyclic references nodes', function () {
      const { graph, n1, n2 } = setup()

      graph.addEdge(n1, n2)

      const n3 = graph.addNode({ id: 'N-3', value: 0 })
      graph.addEdge(n2, n3)
      graph.addEdge(n3, n2)

      graph.pruneNode(n2)

      assert.deepEqual(
        Array.from(graph.nodes()).map((n) => n.id),
        [n1],
      )
    })

    it('prunes newly-orphaned nodes', function () {
      const { graph, n1, n2 } = setup()

      const n3 = graph.addNode({ id: 'N-3', value: 0 })

      graph.addEdge(n1, n2)
      graph.addEdge(n2, n3)

      graph.pruneNode(n2)

      assert.deepEqual(
        Array.from(graph.nodes()).map((n) => n.id),
        [n1],
      )
    })
  })
})
