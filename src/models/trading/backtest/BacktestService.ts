import moment from 'moment'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import PositionRepository from 'infra/db/repository/PositionRepository'
import OandaTickRepository from 'infra/oanda/OandaTickRepository'
import ClosingPolicy from 'models/trading//core/ClosingPolicy'
import ModifyOrderValidator from 'models/trading/backtest/validation/ModifyOrderValidator'
import OrderValidator from 'models/trading/backtest/validation/OrderValidator'
import CounterPairResolver from 'models/trading/common/CounterPairResolver'
import Backtest from 'models/trading/core/Backtest'
import { Interval, IntervalUtil } from 'models/trading/core/Interval'
import Order, { AffectedPosition, ModifyOrder, OrderResult } from 'models/trading/core/Order'
import Pair from 'models/trading/core/Pair'
import Position from 'models/trading/core/Position'
import Tick, { TickValue } from 'models/trading/core/Tick'
import TickFiller, { FilledTicks } from 'models/trading/core/TickFiller'
import PriceUtils from 'models/trading/utils/PriceUtils'
import ThreadUtil from 'utils/ThreadUtil'

/**
 * バックテスト用に保持しているポジションやオーダーを管理するサービス
 * ポジションの作成やオーダーの約定, ポジションの保存はこのサービスで行う
 */
export default class BacktestService {
    private readonly tickRepository: OandaTickRepository
    private readonly positionRepository: PositionRepository
    private readonly orderValidator: OrderValidator
    private readonly modifyOrderValidator: ModifyOrderValidator
    private readonly start: Date
    private readonly end: Date
    private readonly interval: Interval
    private readonly instruments: string[]

    private filledTime: Date
    private buffer: Tick[] = []
    private currentTick: Tick | null = null

    private orderId: number = 0
    private orders: Order[] = []
    private positions: Position[] = []
    private pairs: Pair[]

    constructor(backtest: Backtest, backtestId: string, pairs: Pair[]) {
        this.tickRepository = new OandaTickRepository()
        this.positionRepository = new PositionRepository(backtestId)
        this.orderValidator = new OrderValidator()
        this.modifyOrderValidator = new ModifyOrderValidator()
        this.start = backtest.start
        this.end = moment(backtest.end).add(1, 'seconds').toDate()
        this.interval = backtest.interval
        const allInstruments = pairs.map((p) => {
            return p.name
        })
        const resolver = container.get<CounterPairResolver>(TYPES.CounterPairResolver)
        const requiredInstruments = resolver.resolveRequiredInstruments(allInstruments, backtest.instruments)
        this.instruments = requiredInstruments
        this.filledTime = this.start
        this.pairs = pairs
    }

    getPositions(): Position[] {
        return this.positions
    }

    getOpenedPositions(): Position[] {
        return this.positions.filter((p) => {
            return p.status === 'Live'
        })
    }

    getOrders(): Order[] {
        return this.orders
    }

    getCurrentTick(): Tick | null {
        return this.currentTick
    }

    async advanceTick() {
        if (this.buffer.length === 0) {
            await this.fillBuffer()
        }
        const tick = this.buffer.shift()
        if (tick != null) {
            this.currentTick = tick
            await this.updateOrders(tick)
            await this.updatePositions(tick)
        }
    }

    async hasNext(): Promise<boolean> {
        if (this.buffer.length === 0) {
            await this.fillBuffer()
        }
        return this.buffer.length > 0
    }

    async modifyPosition(id: string, closingPolicy: ClosingPolicy) {
        const target = this.getOpenedPositions().find((p) => {
            return p.id === id
        })
        if (target == null) {
            return
        }
        target.closingPolicy = closingPolicy
        await this.positionRepository.updatePosition(target)
    }

    async closePosition(id: string) {
        const position = this.getOpenedPositions().find((p) => {
            return p.id === id
        })
        position?.updateStatusToClosed()
        if (position != null) {
            await this.positionRepository.updatePosition(position)
        }
    }

    async order(order: Order): Promise<OrderResult> {
        if (this.currentTick == null) {
            throw new Error('ティックが取得できていません')
        }
        if (!this.orderValidator.validate(order)) {
            throw new Error('不正なオーダーです')
        }
        // IDを割り当てる
        order.id = this.getOrderId()
        if (order.carriedOut(this.currentTick)) {
            // 即時約定可能であればポジションを登録する
            return await this.registerPosition(order, this.currentTick)
        } else {
            // まだ約定できない場合は保持しておく
            this.orders.push(order)
            return new OrderResult(order, null, null, [])
        }
    }

    async modifyOrder(id: string, modifyOrder: ModifyOrder) {
        const target = this.orders.find((o) => {
            return o.id === id
        })
        if (target == null) {
            return
        }
        if (!this.modifyOrderValidator.validate(target, modifyOrder)) {
            throw new Error('不正なオーダーです')
        }
        modifyOrder.apply(target)
    }

    async cancelOrder(id: string) {
        this.orders = this.orders.filter((o) => {
            return o.id != id
        })
    }

    // Fill ticks

    private async fillBuffer() {
        while (true) {
            await this.loadInstrumentsTicks()
            if (this.buffer.length > 0) {
                break
            }
            if (moment(this.filledTime).isSameOrAfter(moment(this.end))) {
                break
            }
        }
    }

    private async loadInstrumentsTicks() {
        const responses: FilledTicks[] = []
        const offset = IntervalUtil.secondsFromInterval(this.interval) * 500
        const start = this.filledTime
        const end = moment(this.filledTime).add(offset, 'seconds')
        const adjustedEnd = end.isAfter(moment(this.end)) ? this.end : end.toDate()
        for (const instrument of this.instruments) {
            const candles = await this.tickRepository.fetchTicks(instrument, this.interval.toString(), start, adjustedEnd)
            const filled = await new TickFiller(start, adjustedEnd, candles).fill()
            responses.push(filled)
            ThreadUtil.sleep(0.1)
        }
        const ticks = this.mergeTicks(responses).sort((a, b) => {
            return moment(a.timestamp).isAfter(b.timestamp) ? 1 : -1
        })
        for (const tick of ticks) {
            this.buffer.push(tick)
        }
        this.filledTime = adjustedEnd
    }

    private mergeTicks(filledTisksList: FilledTicks[]): Tick[] {
        const timestamps = filledTisksList
            .map((f) => {
                return f.ticks.map((t) => {
                    return moment(t.timestamp)
                })
            })
            .reduce((acc, value) => acc.concat(value), [])
        const dates: number[] = []
        const uniqTimestamps: moment.Moment[] = []
        for (const ts of timestamps) {
            if (dates.includes(ts.unix()) === false) {
                dates.push(ts.unix())
                uniqTimestamps.push(ts)
            }
        }
        const ticks: Tick[] = []
        for (const ts of uniqTimestamps) {
            const values: TickValue[] = []
            for (const filledTicks of filledTisksList) {
                const target = filledTicks.ticks.find((t) => {
                    return moment(t.timestamp).isSame(ts)
                })
                if (target != null) {
                    values.push(target.value)
                }
            }
            ticks.push(new Tick(values, ts.toDate()))
        }
        return ticks
    }

    // Update orders and positions

    private async updateOrders(tick: Tick) {
        this.orders = this.orders.filter((o) => {
            return !o.expired(tick.timestamp)
        })
        for (const order of this.orders) {
            if (order.carriedOut(tick)) {
                this.registerPosition(order, tick)
            }
        }
    }

    private async updatePositions(tick: Tick) {
        for (const position of this.getOpenedPositions()) {
            const pair = this.pairs.find((p) => {
                return p.name === position.instrument
            })
            if (pair == null) {
                throw new Error('更新対象の通貨ペアが見つかりません')
            }
            position.updatePrice(tick)
            position.closingPolicy?.updatePrice(position, pair)
            if (position.shouldClose()) {
                position.updateStatusToClosed()
            }
            await this.positionRepository.updatePosition(position)
        }
    }

    // Register position

    private getOrderId(): string {
        this.orderId += 1
        return `${this.orderId}`
    }

    private async registerPosition(order: Order, tick: Tick): Promise<OrderResult> {
        const position = Position.createFromOrder(order, tick)
        position.updatePrice(tick)
        const result = await this.closeOrReducePositions(position, tick)
        if (position.units > 0) {
            this.positions.push(position)
            await this.positionRepository.pushPosition(position)
            order.units = position.units
        }
        for (const closed of result.closedPositions) {
            const target = this.getOpenedPositions().find((p) => {
                return p.id === closed.id
            })
            if (target != null) {
                target.updateStatusToClosed()
                await this.positionRepository.updatePosition(target)
            }
        }
        if (result.reducedPosition != null) {
            const target = this.getOpenedPositions().find((p) => {
                return p.id === result.reducedPosition?.id
            })
            if (target != null) {
                this.registerSplitedPosition(target, result.reducedPosition)
                target.units -= result.reducedPosition.units
                await this.positionRepository.updatePosition(target)
            }
        }
        if (position.units > 0) {
            return new OrderResult(null, position, null, result.closedPositions)
        } else {
            return new OrderResult(null, null, result.reducedPosition, result.closedPositions)
        }
    }

    private async closeOrReducePositions(newPosition: Position, tick: Tick): Promise<BacktestOrderResult> {
        const result = new BacktestOrderResult()
        const reservedPositions = this.getOpenedPositions().filter((p) => {
            return p.instrument === newPosition.instrument && p.sellOrBuy != newPosition.sellOrBuy
        })
        for (const reservedPosition of reservedPositions) {
            this.closeOrReducePosition(result, reservedPosition, newPosition, tick)
        }
        return result
    }

    private async closeOrReducePosition(result: BacktestOrderResult, reservedPosition: Position, newPosition: Position, tick: Tick) {
        const units = newPosition.units
        if (units <= 0) {
            return
        }
        if (reservedPosition.units <= newPosition.units) {
            const price = PriceUtils.currentPrice(tick, reservedPosition.instrument, reservedPosition.sellOrBuy)
            const closedPosition = new AffectedPosition(reservedPosition.id, reservedPosition.units, price, tick.timestamp)
            result.closedPositions.push(closedPosition)
            newPosition.units -= reservedPosition.units
        } else {
            newPosition.units = 0
            const price = PriceUtils.currentPrice(tick, reservedPosition.instrument, reservedPosition.sellOrBuy)
            const reducedPosition = new AffectedPosition(reservedPosition.id, units, price, tick.timestamp)
            result.reducedPosition = reducedPosition
        }
    }

    private async registerSplitedPosition(reservedPosition: Position, reducedPosition: AffectedPosition) {
        const closePosition = Position.createSplited(reservedPosition, reducedPosition)
        this.positions.push(closePosition)
        await this.positionRepository.pushPosition(closePosition)
    }
}

class BacktestOrderResult {
    closedPositions: AffectedPosition[] = []
    reducedPosition: AffectedPosition | null = null
}
