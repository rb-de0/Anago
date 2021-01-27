import Graph, { GraphType } from 'models/trading/core/Graph'
import GraphData from 'models/trading/core/GraphData'

export default interface GraphPainter {
    createGraph(type: GraphType, name: string, maxY: number | null, minY: number | null): Promise<Graph | null>
    pushGraphData(graph: Graph, data: GraphData): Promise<void>
}
