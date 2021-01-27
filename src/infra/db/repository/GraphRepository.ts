import { BacktestModel } from 'infra/db/schema/BacktestSchema'
import Graph, { GraphType } from 'models/trading/core/Graph'
import GraphData from 'models/trading/core/GraphData'
import GraphPainter from 'models/trading/core/GraphPainter'

export class BacktestGraphRepository implements GraphPainter {
    private readonly backtestId: string

    constructor(backtestId: string) {
        this.backtestId = backtestId
    }

    async createGraph(type: GraphType, name: string, maxY: number | null, minY: number | null): Promise<Graph | null> {
        const newGraph = new Graph(type, name, [], maxY, minY)
        const backtest = await BacktestModel.findById(this.backtestId).exec()
        backtest?.graphs.push(newGraph)
        await backtest?.save()
        return newGraph
    }

    async pushGraphData(graph: Graph, data: GraphData): Promise<void> {
        await BacktestModel.findOneAndUpdate(
            { _id: this.backtestId, 'graphs._id': graph._id },
            {
                $push: { 'graphs.$.data': data },
            }
        )
    }
}

export class RealTradeGraphRepository implements GraphPainter {
    async createGraph(): Promise<Graph | null> {
        return null
    }

    async pushGraphData(): Promise<void> {
        return
    }
}
