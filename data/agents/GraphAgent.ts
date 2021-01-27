import * as model from 'Model'

export default class GraphAgent extends model.Agent {
    name = 'TestAgent'
    description = 'TestAgent Description'

    lineGraph: model.Graph | null = null
    lineGraph2: model.Graph | null = null

    async setup() {
        this.lineGraph = await this.graphPainter.createGraph('line', 'line1', 100, 0)
        this.lineGraph2 = await this.graphPainter.createGraph('line', 'line2', 70, 30)
    }
    
    async nextTick(tick: model.Tick) {
        console.log(tick)
        if (this.lineGraph != null && tick.values.length > 0) {
            const min = Math.ceil(0)
            const max = Math.floor(100)
            const value = Math.floor(Math.random() * (max - min)) + min
            await this.graphPainter.pushGraphData(this.lineGraph, new model.GraphData(tick.timestamp, value))
        }
        if (this.lineGraph2 != null && tick.values.length > 0) {
            const min = Math.ceil(30)
            const max = Math.floor(70)
            const value = Math.floor(Math.random() * (max - min)) + min
            await this.graphPainter.pushGraphData(this.lineGraph2, new model.GraphData(tick.timestamp, value))
        }
    }
}