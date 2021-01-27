import * as model from 'Model'
import { MovingAverage } from 'Root/Utils'

export default class MAAGent extends model.Agent {
    name = 'TestAgent'
    description = 'TestAgent Description'

    private ma5Graph!: model.Graph
    private ma25Graph!: model.Graph
    private ma5!: MovingAverage
    private ma25!: MovingAverage

    private ma5Value: number | null = null
    private ma25Value: number | null = null

    async setup() {
        this.ma5 = new MovingAverage(25)
        this.ma25 = new MovingAverage(75)
        this.ma5Graph = await this.graphPainter.createGraph('rate', 'ma5', null, null)
        this.ma25Graph = await this.graphPainter.createGraph('rate', 'ma25', null, null)
    }

    async nextTick(tick: model.Tick) {
        if (tick.values.length === 0) {
            return
        }
        this.ma5.push(tick.values[0].ask)
        this.ma25.push(tick.values[0].ask)
        const newMa5Value = this.ma5.value()
        const newMa25Value = this.ma25.value()
        if (newMa5Value != null) {
            await this.graphPainter.pushGraphData(this.ma5Graph, new model.GraphData(tick.timestamp, newMa5Value))
        }
        if (newMa25Value != null) {
            await this.graphPainter.pushGraphData(this.ma25Graph, new model.GraphData(tick.timestamp, newMa25Value))
        }
        if (this.shouldSell() === true) {
            await this.closeAllPositions('Buy')
            const order = model.Order.market('USD_JPY', 'Sell', 10000)
            await this.broker.order(order)
        }
        if (this.shouldBuy() === true) {
            await this.closeAllPositions('Sell')
            const order = model.Order.market('USD_JPY', 'Buy', 10000)
            await this.broker.order(order)
        }
        this.ma5Value = newMa5Value
        this.ma25Value = newMa25Value
    }

    private shouldSell(): boolean {
        const newMa5Value = this.ma5.value()
        const newMa25Value = this.ma25.value()
        if (newMa5Value != null && newMa25Value != null && this.ma5Value != null && this.ma25Value != null) {
            return newMa5Value < newMa25Value && this.ma5Value > this.ma25Value
        }
        return false
    }

    private shouldBuy(): boolean {
        const newMa5Value = this.ma5.value()
        const newMa25Value = this.ma25.value()
        if (newMa5Value != null && newMa25Value != null && this.ma5Value != null && this.ma25Value != null) {
            return newMa5Value > newMa25Value && this.ma5Value < this.ma25Value
        }
        return false
    }

    private async closeAllPositions(sellOrBuy: model.SellOrBuy) {
        const positions = await this.broker.positions()
        const closePositions = positions.filter((p) => {
            return p.sellOrBuy === sellOrBuy
        })
        for (const p of closePositions) {
            await this.broker.closePosition(p.id)
        }
    }
}