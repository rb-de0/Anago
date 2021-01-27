import * as model from 'Model'
import { RSI } from 'Root/Utils'

export default class RSIAgent extends model.Agent {
    name = 'TestAgent'
    description = 'TestAgent Description'

    private lineGraph!: model.Graph
    private rsi!: RSI
    private rsiValue: number | null = null

    async setup() {
        this.lineGraph = await this.graphPainter.createGraph('line', 'rsi', 100, 0)
        this.rsi = new RSI()
    }
    
    async nextTick(tick: model.Tick) {
        if (tick.values.length === 0) {
            return
        }
        this.rsi.push(tick.values[0].ask)
        const rsiValue = this.rsi.value()
        if (rsiValue != null) {
            if (this.shouldBuy(rsiValue) === true) {
                await this.closeAllPositions('Sell')
                const order = model.Order.market('AUD_JPY', 'Buy', 10000)
                await this.broker.order(order)
            }
            if (this.shouldSell(rsiValue) === true) {
                await this.closeAllPositions('Buy')
                const order = model.Order.market('AUD_JPY', 'Sell', 10000)
                await this.broker.order(order)
            }
            await this.graphPainter.pushGraphData(this.lineGraph, new model.GraphData(tick.timestamp, rsiValue))
        }
        this.rsiValue = rsiValue
    }

    private shouldBuy(rsiValue: number): boolean {
        if (this.rsiValue == null) {
            return false
        }
        return rsiValue > 32 && this.rsiValue < 28
    }

    private shouldSell(rsiValue: number): boolean {
        if (this.rsiValue == null) {
            return false
        }
        return rsiValue < 68 && this.rsiValue > 72
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