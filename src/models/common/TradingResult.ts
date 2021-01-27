import Position from 'models/trading/core/Position'

export default class TradingResult {
    readonly balance: number
    readonly profitOrLoss: ProfitOrLoss
    readonly winRate: WinRate
    readonly tradingCount: TradingCount
    readonly tradingUnits: TradingUnits
    readonly sellOrBuyCount: SellOrBuyCount
    readonly instrumentCounts: InstrumentCount[]

    constructor(
        balance: number,
        profitOrLoss: ProfitOrLoss,
        winRate: WinRate,
        tradingCount: TradingCount,
        tradingUnits: TradingUnits,
        sellOrBuyCount: SellOrBuyCount,
        instrumentCounts: InstrumentCount[]
    ) {
        this.balance = balance
        this.profitOrLoss = profitOrLoss
        this.winRate = winRate
        this.tradingCount = tradingCount
        this.tradingUnits = tradingUnits
        this.sellOrBuyCount = sellOrBuyCount
        this.instrumentCounts = instrumentCounts
    }

    static makeFrom(balance: number, positions: Position[]): TradingResult | null {
        if (positions.length === 0) {
            return null
        }
        // profit or loss
        const profitOrLossValues = positions
            .map((p) => {
                return p.profitOrLoss
            })
            .filter((p): p is number => {
                return p != null
            })
        const profitValues = profitOrLossValues.filter((p) => {
            return p > 0
        })
        const profit =
            profitValues.length === 0
                ? 0
                : profitValues.reduce((a, b) => {
                      return a + b
                  })
        const lossValues = profitOrLossValues.filter((p) => {
            return p < 0
        })
        const loss =
            lossValues.length === 0
                ? 0
                : lossValues.reduce((a, b) => {
                      return a + b
                  })
        const profitOrLoss = new ProfitOrLoss(profit, loss)
        // win rate
        const win = profitOrLossValues.filter((p) => {
            return p > 0
        }).length
        const lose = profitOrLossValues.filter((p) => {
            return p < 0
        }).length
        const winRate = new WinRate(win, lose)
        // trading count
        const live = positions.filter((p) => {
            return p.status == 'Live'
        }).length
        const closed = positions.filter((p) => {
            return p.status == 'Closed'
        }).length
        const tradingCount = new TradingCount(live, closed)
        // trading units
        const units = positions.map((p) => {
            return p.units
        })
        const max = units.reduce((a, b) => {
            return Math.max(a, b)
        })
        const min = units.reduce((a, b) => {
            return Math.min(a, b)
        })
        const sum = units.reduce((a, b) => {
            return a + b
        })
        const agv = Math.round(sum / positions.length)
        const tradingUnits = new TradingUnits(max, min, agv)
        // sell or buy
        const sellCount = positions.filter((p) => {
            return p.sellOrBuy == 'Sell'
        }).length
        const buyCount = positions.filter((p) => {
            return p.sellOrBuy == 'Buy'
        }).length
        const sellOrBuy = new SellOrBuyCount(sellCount, buyCount)
        // instrument count
        const instrumentCounts: InstrumentCount[] = []
        for (const position of positions) {
            const target = instrumentCounts.find((i) => {
                return i.name === position.instrument
            })
            if (target != null) {
                target.count += 1
            } else {
                const instrument = new InstrumentCount(position.instrument, 1)
                instrumentCounts.push(instrument)
            }
        }
        return new TradingResult(balance, profitOrLoss, winRate, tradingCount, tradingUnits, sellOrBuy, instrumentCounts)
    }
}

export class ProfitOrLoss {
    readonly profit: number
    readonly loss: number

    constructor(profit: number, loss: number) {
        this.profit = profit
        this.loss = loss
    }
}

export class WinRate {
    readonly win: number
    readonly lose: number

    constructor(win: number, lose: number) {
        this.win = win
        this.lose = lose
    }
}

export class TradingCount {
    readonly live: number
    readonly closed: number

    constructor(live: number, closed: number) {
        this.live = live
        this.closed = closed
    }
}

export class TradingUnits {
    readonly max: number
    readonly min: number
    readonly agv: number

    constructor(max: number, min: number, agv: number) {
        this.max = max
        this.min = min
        this.agv = agv
    }
}

export class SellOrBuyCount {
    readonly sell: number
    readonly buy: number

    constructor(sell: number, buy: number) {
        this.sell = sell
        this.buy = buy
    }
}

export class InstrumentCount {
    readonly name: string
    count: number

    constructor(name: string, count: number) {
        this.name = name
        this.count = count
    }
}
