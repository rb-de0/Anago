import moment from 'moment'
import Position from 'models/trading/core/Position'
import { SellOrBuy } from 'models/trading/core/SellOrBuy'
import Tick from 'models/trading/core/Tick'
import PriceUtils from 'models/trading/utils/PriceUtils'
import OandaOrder from 'infra/oanda/entities/OandaOrder'
import OandaOrderResult, { OrderCreateTransaction } from 'infra/oanda/entities/OandaOrderResult'

export default class Order {
    readonly type: OrderType
    readonly instrument: string
    readonly sellOrBuy: SellOrBuy

    id: string = ''
    units: number
    price: number | null
    initialPrice: number | null = null
    timeInForce: string | null
    gtdTime: Date | null
    takeProfitOnFill: TakeProfitDetails | null
    stopLossOnFill: StopLossDetails | null
    trailingStopLossOnFill: TrailingStopLossDetails | null

    constructor(
        type: OrderType,
        instrument: string,
        sellOrBuy: SellOrBuy,
        units: number,
        price: number | null,
        timeInForce: string | null,
        gtdTime: Date | null,
        takeProfitOnFill: TakeProfitDetails | null,
        stopLossOnFill: StopLossDetails | null,
        trailingStopLossOnFill: TrailingStopLossDetails | null
    ) {
        this.type = type
        this.instrument = instrument
        this.sellOrBuy = sellOrBuy
        this.units = units
        this.price = price
        this.timeInForce = timeInForce
        this.gtdTime = gtdTime
        this.takeProfitOnFill = takeProfitOnFill
        this.stopLossOnFill = stopLossOnFill
        this.trailingStopLossOnFill = trailingStopLossOnFill
    }

    static market(instrument: string, sellOrBuy: SellOrBuy, units: number): Order {
        return new Order('market', instrument, sellOrBuy, units, null, null, null, null, null, null)
    }

    static stop(instrument: string, sellOrBuy: SellOrBuy, units: number, price: number): Order {
        return new Order('stop', instrument, sellOrBuy, units, price, null, null, null, null, null)
    }

    static limit(instrument: string, sellOrBuy: SellOrBuy, units: number, price: number): Order {
        return new Order('limit', instrument, sellOrBuy, units, price, null, null, null, null, null)
    }

    static createFromOanda(order: OandaOrder): Order | null {
        let type: OrderType = 'market'
        switch (order.type) {
            case 'MARKET':
                type = 'market'
                break
            case 'LIMIT':
                type = 'limit'
                break
            case 'STOP':
                type = 'stop'
                break
            case 'MARKET_IF_TOUCHED':
                type = 'marketIfTouched'
                break
            default:
                return null
        }
        if (order.instrument == null || order.units == null) {
            return null
        }
        const gtdTime = order.gtdTime != null ? moment(order.gtdTime).toDate() : null
        const sellOrBuy: SellOrBuy = order.units < 0 ? 'Sell' : 'Buy'
        const newOrder = new Order(type, order.instrument, sellOrBuy, Math.abs(order.units), order.price, order.timeInForce, gtdTime, null, null, null)
        newOrder.id = order.id
        if (order.takeProfitOnFill != null) {
            newOrder.takeProfitOnFill = new TakeProfitDetails(order.takeProfitOnFill.price)
        }
        if (order.stopLossOnFill?.price != null) {
            newOrder.stopLossOnFill = new StopLossDetails(order.stopLossOnFill.price)
        }
        if (order.trailingStopLossOnFill != null) {
            newOrder.trailingStopLossOnFill = new TrailingStopLossDetails(null, order.trailingStopLossOnFill.distance)
        }
        return newOrder
    }

    static createFromOandaTransaction(transaction: OrderCreateTransaction): Order | null {
        let type: OrderType = 'market'
        switch (transaction.type) {
            case 'MARKET':
                type = 'market'
                break
            case 'LIMIT':
                type = 'limit'
                break
            case 'STOP':
                type = 'stop'
                break
            case 'MARKET_IF_TOUCHED':
                type = 'marketIfTouched'
                break
            default:
                return null
        }
        const gtdTime = transaction.gtdTime != null ? moment(transaction.gtdTime).toDate() : null
        const sellOrBuy: SellOrBuy = transaction.units < 0 ? 'Sell' : 'Buy'
        const newOrder = new Order(type, transaction.instrument, sellOrBuy, Math.abs(transaction.units), transaction.price, transaction.timeInForce, gtdTime, null, null, null)
        if (transaction.takeProfitOnFill != null) {
            newOrder.takeProfitOnFill = new TakeProfitDetails(transaction.takeProfitOnFill.price)
        }
        if (transaction.stopLossOnFill?.price != null) {
            newOrder.stopLossOnFill = new StopLossDetails(transaction.stopLossOnFill.price)
        }
        if (transaction.trailingStopLossOnFill != null) {
            newOrder.trailingStopLossOnFill = new TrailingStopLossDetails(null, transaction.trailingStopLossOnFill.distance)
        }
        return newOrder
    }

    // 約定可能かどうか
    carriedOut(tick: Tick): boolean {
        const entryPrice = PriceUtils.entryPrice(tick, this.instrument, this.sellOrBuy)
        if (entryPrice == null) {
            return false
        }
        switch (this.type) {
            case 'market':
                return true
            case 'limit':
                return this.sellOrBuy === 'Buy' ? this.upper(entryPrice) : this.lower(entryPrice)
            case 'stop':
                return this.sellOrBuy === 'Buy' ? this.lower(entryPrice) : this.upper(entryPrice)
            case 'marketIfTouched':
                return this.marketIfTouched(entryPrice)
        }
    }

    // 期限が切れているか
    expired(timestamp: Date): boolean {
        if (this.timeInForce === 'GTD' && this.gtdTime != null) {
            return moment(this.gtdTime).isSameOrBefore(moment(timestamp))
        }
        return false
    }

    private upper(price: number): boolean {
        return price >= (this.price ?? 0)
    }

    private lower(price: number): boolean {
        return price <= (this.price ?? 0)
    }

    private marketIfTouched(price: number): boolean {
        if (this.initialPrice == null) {
            this.initialPrice = price
        }
        return this.initialPrice < (this.price ?? 0) ? this.upper(price) : this.lower(price)
    }
}

export type OrderType = 'market' | 'limit' | 'stop' | 'marketIfTouched'

export class TakeProfitDetails {
    price: number
    constructor(price: number) {
        this.price = price
    }
}

export class StopLossDetails {
    price: number
    constructor(price: number) {
        this.price = price
    }
}

export class TrailingStopLossDetails {
    price: number | null = null
    distance: number | null = null
    constructor(price: number | null, distance: number | null) {
        this.price = price
        this.distance = distance
    }
}

/**
 * 部分的に決済されたポジションやクローズされたポジションの情報
 */
export class AffectedPosition {
    readonly id: string
    readonly units: number
    readonly price: number
    readonly timestamp: Date

    constructor(id: string, units: number, price: number, timestamp: Date) {
        this.id = id
        this.units = units
        this.price = price
        this.timestamp = timestamp
    }
}

export class OrderResult {
    readonly openedOrder: Order | null
    readonly openedPosition: Position | null
    readonly reducedPosition: AffectedPosition | null
    readonly closedPositions: AffectedPosition[]

    constructor(openedOrder: Order | null, openedPosition: Position | null, reducedPosition: AffectedPosition | null, closedPositions: AffectedPosition[]) {
        this.openedOrder = openedOrder
        this.openedPosition = openedPosition
        this.reducedPosition = reducedPosition
        this.closedPositions = closedPositions
    }

    static makeFromOanda(result: OandaOrderResult, position: Position | null): OrderResult {
        if (result.orderFillTransaction == null) {
            return new OrderResult(null, null, null, [])
        } else {
            let opened: Order | null
            if (result.orderCreateTransaction == null) {
                opened = null
            } else {
                opened = Order.createFromOandaTransaction(result.orderCreateTransaction)
            }
            const time = moment(result.orderFillTransaction.time).toDate()
            const tradeReduced = result.orderFillTransaction.tradeReduced
            const reduced = tradeReduced != null ? new AffectedPosition(tradeReduced.tradeID, tradeReduced.units, tradeReduced.price, time) : null
            const tradesClosed = result.orderFillTransaction.tradesClosed
            const closed =
                tradesClosed != null
                    ? tradesClosed.map((t) => {
                          return new AffectedPosition(t.tradeID, t.units, t.price, time)
                      })
                    : []
            return new OrderResult(opened, position, reduced, closed)
        }
    }
}

export class ModifyOrder {
    units: number | null
    price: number | null
    timeInForce: string | null
    gtdTime: Date | null
    takeProfitOnFill: TakeProfitDetails | null
    stopLossOnFill: StopLossDetails | null
    trailingStopLossOnFill: TrailingStopLossDetails | null

    constructor(
        units: number | null,
        price: number | null,
        timeInForce: string | null,
        gtdTime: Date | null,
        takeProfitOnFill: TakeProfitDetails | null,
        stopLossOnFill: StopLossDetails | null,
        trailingStopLossOnFill: TrailingStopLossDetails | null
    ) {
        this.units = units
        this.price = price
        this.timeInForce = timeInForce
        this.gtdTime = gtdTime
        this.takeProfitOnFill = takeProfitOnFill
        this.stopLossOnFill = stopLossOnFill
        this.trailingStopLossOnFill = trailingStopLossOnFill
    }

    apply(order: Order) {
        if (this.units != null) {
            order.units = this.units
        }
        if (this.price != null) {
            order.price = this.price
        }
        if (this.timeInForce != null) {
            order.timeInForce = this.timeInForce
        }
        if (this.gtdTime != null) {
            order.gtdTime = this.gtdTime
        }
        if (this.takeProfitOnFill != null) {
            order.takeProfitOnFill = this.takeProfitOnFill
        }
        if (this.stopLossOnFill != null) {
            order.stopLossOnFill = this.stopLossOnFill
        }
        if (this.stopLossOnFill != null) {
            order.stopLossOnFill = this.stopLossOnFill
        }
    }
}
