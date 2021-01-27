import moment from 'moment'
import mongoose from 'mongoose'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import { PositionDocument } from 'infra/db/schema/PositionSchema'
import OandaTrade from 'infra/oanda/entities/OandaTrade'
import CounterPairResolver from 'models/trading/common/CounterPairResolver'
import ClosingPolicy from 'models/trading/core/ClosingPolicy'
import Order, { AffectedPosition } from 'models/trading/core/Order'
import { SellOrBuy } from 'models/trading/core/SellOrBuy'
import Tick from 'models/trading/core/Tick'
import PriceUtils from 'models/trading/utils/PriceUtils'

export default class Position implements PositionDocument {
    readonly instrument: string
    readonly sellOrBuy: SellOrBuy
    readonly entryPrice: number
    readonly entriedAt: Date

    id: string
    _id: mongoose.Types.ObjectId
    units: number
    price: number | null = null
    updatedAt: Date | null = null
    closePrice: number | null = null
    closedAt: Date | null = null
    counterRate: number | null = null
    profitOrLoss: number | null = null
    closingPolicy: ClosingPolicy | null = null
    status: PositionStatus

    constructor(instrument: string, sellOrBuy: SellOrBuy, units: number, entryPrice: number, entriedAt: Date, status: PositionStatus) {
        this._id = mongoose.Types.ObjectId()
        this.id = this._id.toHexString()
        this.instrument = instrument
        this.sellOrBuy = sellOrBuy
        this.units = units
        this.entryPrice = entryPrice
        this.entriedAt = entriedAt
        this.status = status
        this.sellOrBuy = sellOrBuy
    }

    // Create

    static createFromOrder(order: Order, tick: Tick): Position {
        const entryPrice = order.type === 'market' ? PriceUtils.entryPrice(tick, order.instrument, order.sellOrBuy) : order.price
        if (entryPrice == null) {
            throw new Error('不正な注文です')
        }
        const position = new Position(order.instrument, order.sellOrBuy, order.units, entryPrice, tick.timestamp, 'Live')
        position.closingPolicy = ClosingPolicy.createFromOrder(order)
        return position
    }

    static createSplited(reservedPosition: Position, reducedPosition: AffectedPosition): Position {
        const position = new Position(
            reservedPosition.instrument,
            reservedPosition.sellOrBuy,
            reservedPosition.units - reducedPosition.units,
            reservedPosition.entryPrice,
            reservedPosition.entriedAt,
            'Live'
        )
        position.updatedAt = reservedPosition.updatedAt
        position.price = reservedPosition.price
        position.counterRate = reservedPosition.counterRate
        position.closingPolicy = reservedPosition.closingPolicy
        position.calculateProfitLoss()
        position.updateStatusToClosed()
        return position
    }

    static createFromOanda(trade: OandaTrade): Position {
        const sellOrBuy = trade.currentUnits < 0 ? 'Sell' : 'Buy'
        let status: PositionStatus = 'Live'
        switch (trade.state) {
            case 'OPEN':
                status = 'Live'
                break
            case 'CLOSED':
                status = 'Closed'
                break
            case 'CLOSE_WHEN_TRADEABLE':
                status = 'Live'
                break
        }
        const units = status == 'Live' ? trade.currentUnits : trade.initialUnits
        const position = new Position(trade.instrument, sellOrBuy, Math.abs(units), trade.price, moment(trade.openTime).toDate(), status)
        position.id = trade.id
        position.closingPolicy = ClosingPolicy.createFromTrade(trade)
        position.profitOrLoss = status == 'Live' ? trade.unrealizedPL : trade.realizedPL
        position.closePrice = trade.averageClosePrice
        position.closedAt = trade.closeTime != null ? moment(trade.closeTime).toDate() : null
        return position
    }

    // Update

    updatePrice(tick: Tick) {
        if (this.status != 'Live') {
            return
        }
        this.price = PriceUtils.currentPrice(tick, this.instrument, this.sellOrBuy)
        this.counterRate = container.get<CounterPairResolver>(TYPES.CounterPairResolver).resolveRate(tick, this.instrument)
        this.profitOrLoss = this.calculateProfitLoss()
        this.updatedAt = tick.timestamp
    }

    private calculateProfitLoss(): number | null {
        if (this.price == null) {
            return null
        }
        if (this.counterRate == null) {
            return null
        }
        const current = this.price * this.units
        const entry = this.entryPrice * this.units
        return (current - entry) * (this.sellOrBuy === 'Buy' ? 1 : -1) * this.counterRate
    }

    // Close

    shouldClose(): boolean {
        if (this.closingPolicy == null) {
            return false
        }
        return this.closingPolicy.shouldClose(this)
    }

    updateStatusToClosed() {
        if (this.status != 'Live') {
            return
        }
        this.closePrice = this.price
        this.closedAt = this.updatedAt
        this.status = 'Closed'
    }
}

export type PositionStatus = 'Live' | 'Closed'
