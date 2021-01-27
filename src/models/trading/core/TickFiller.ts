import moment from 'moment'
import OandaCandles from 'infra/oanda/entities/OandaCandles'
import OandaCandleStick from 'infra/oanda/entities/OandaCandleStick'
import OandaTickRepository from 'infra/oanda/OandaTickRepository'
import { IntervalUtil } from 'models/trading/core/Interval'
import { TickValue } from 'models/trading/core/Tick'

/**
 * Tickを補間するためのService
 * 休日等, 市場がクローズしている間はクローズ直前のレートを流し続ける
 */
export default class TickFiller {
    private readonly repository: OandaTickRepository
    private readonly end: Date
    private readonly granularity: string
    private readonly instument: string

    private candles: OandaCandleStick[]
    private currentTime: Date
    private result: FilledTickValue[] = []

    constructor(start: Date, end: Date, candles: OandaCandles) {
        this.repository = new OandaTickRepository()
        this.end = end
        this.currentTime = start
        this.granularity = candles.granularity
        this.instument = candles.instrument
        this.candles = candles.candles
    }

    async fill(): Promise<FilledTicks> {
        const interval = IntervalUtil.secondsFromString(this.granularity)
        while (moment(this.currentTime).isBefore(moment(this.end))) {
            const tick = await this.fetchTick()
            this.result.push(tick)
            this.currentTime = moment(this.currentTime).add(interval, 'second').toDate()
        }
        return new FilledTicks(this.instument, this.result)
    }

    // - Private

    private async fetchTick(): Promise<FilledTickValue> {
        if (this.candles.length > 0) {
            const first = this.candles[0]
            if (moment(first.time).isSame(this.currentTime)) {
                this.candles.shift()
                const value = new TickValue(this.instument, parseFloat(first.bid.o), parseFloat(first.ask.o))
                return new FilledTickValue(value, this.currentTime)
            }
        }
        return await this.resolveLatestTick()
    }

    private async resolveLatestTick(): Promise<FilledTickValue> {
        if (this.result.length === 0) {
            return await this.fetchLatestTick()
        } else {
            const last = this.result[this.result.length - 1]
            return new FilledTickValue(last.value, this.currentTime)
        }
    }

    private async fetchLatestTick(): Promise<FilledTickValue> {
        const offset = IntervalUtil.secondsFromString(this.granularity) * 20
        const candles = await this.repository.fetchTicks(this.instument, this.granularity, moment(this.currentTime).add(-offset, 'seconds').toDate(), this.currentTime)
        if (candles.candles.length > 0) {
            const latest = candles.candles[candles.candles.length - 1]
            const value = new TickValue(this.instument, parseFloat(latest.bid.c), parseFloat(latest.ask.c))
            return new FilledTickValue(value, this.currentTime)
        }
        let historyOffset = 60 * 60 * 24 * 7 * 4
        for (let i = 0; i < 4; i++) {
            const candles = await this.repository.fetchTicks(this.instument, 'H6', moment(this.currentTime).add(-historyOffset, 'seconds').toDate(), this.currentTime)
            if (candles.candles.length > 0) {
                const latest = candles.candles[candles.candles.length - 1]
                const value = new TickValue(this.instument, parseFloat(latest.bid.c), parseFloat(latest.ask.c))
                return new FilledTickValue(value, this.currentTime)
            }
            historyOffset -= historyOffset
        }
        throw new Error('キャンドル履歴の取得に失敗しました')
    }
}

export class FilledTicks {
    readonly instrument: string
    readonly ticks: FilledTickValue[]

    constructor(instrument: string, ticks: FilledTickValue[]) {
        this.instrument = instrument
        this.ticks = ticks
    }
}

export class FilledTickValue {
    readonly value: TickValue
    readonly timestamp: Date

    constructor(value: TickValue, timestamp: Date) {
        this.value = value
        this.timestamp = timestamp
    }
}
