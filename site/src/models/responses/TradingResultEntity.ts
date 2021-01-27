import { Type } from 'class-transformer'

export default class TradingResultEntity {
    readonly balance: number
    @Type(() => ProfitOrLossEntity)
    readonly profitOrLoss: ProfitOrLossEntity | null
    @Type(() => WinRateEntity)
    readonly winRate: WinRateEntity | null
    @Type(() => TradingCountEntity)
    readonly tradingCount: TradingCountEntity | null
    @Type(() => TradingUnitsEntity)
    readonly tradingUnits: TradingUnitsEntity | null
    @Type(() => SellOrBuyCountEntity)
    readonly sellOrBuyCount: SellOrBuyCountEntity | null
    @Type(() => InstrumentCountEntity)
    readonly instrumentCounts: InstrumentCountEntity[]

    constructor(
        balance: number,
        profitOrLoss: ProfitOrLossEntity,
        winRate: WinRateEntity,
        tradingCount: TradingCountEntity,
        tradingUnits: TradingUnitsEntity,
        sellOrBuyCount: SellOrBuyCountEntity,
        instrumentCounts: InstrumentCountEntity[]
    ) {
        this.balance = balance
        this.profitOrLoss = profitOrLoss
        this.winRate = winRate
        this.tradingCount = tradingCount
        this.tradingUnits = tradingUnits
        this.sellOrBuyCount = sellOrBuyCount
        this.instrumentCounts = instrumentCounts
    }
}

export class ProfitOrLossEntity {
    private readonly profit: number
    private readonly loss: number

    get profitValue() {
        const multiplied = this.profit * Math.pow(10, 2)
        return Math.round(multiplied) / Math.pow(10, 2)
    }

    get lossValue() {
        const multiplied = this.loss * Math.pow(10, 2)
        return Math.round(multiplied) / Math.pow(10, 2)
    }

    get sumValue() {
        const sum = this.profit + this.loss
        const multiplied = sum * Math.pow(10, 2)
        return Math.round(multiplied) / Math.pow(10, 2)
    }

    constructor(profit: number, loss: number) {
        this.profit = profit
        this.loss = loss
    }
}

export class WinRateEntity {
    readonly win: number
    readonly lose: number

    get rate() {
        return Math.round(((this.win * 100) / (this.win + this.lose)) * Math.pow(10, 2)) / Math.pow(10, 2)
    }

    constructor(win: number, lose: number) {
        this.win = win
        this.lose = lose
    }
}

export class TradingCountEntity {
    readonly live: number
    readonly closed: number

    get sum() {
        return this.live + this.closed
    }

    constructor(live: number, closed: number) {
        this.live = live
        this.closed = closed
    }
}

export class TradingUnitsEntity {
    readonly max: number
    readonly min: number
    readonly agv: number

    constructor(max: number, min: number, agv: number) {
        this.max = max
        this.min = min
        this.agv = agv
    }
}

export class SellOrBuyCountEntity {
    readonly sell: number
    readonly buy: number

    constructor(sell: number, buy: number) {
        this.sell = sell
        this.buy = buy
    }
}

export class InstrumentCountEntity {
    readonly name: string
    readonly count: number

    constructor(name: string, count: number) {
        this.name = name
        this.count = count
    }
}
