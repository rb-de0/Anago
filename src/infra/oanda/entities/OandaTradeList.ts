import { Type } from 'class-transformer'
import OandaTrade from 'infra/oanda/entities/OandaTrade'

export default class OandaTradeList {
    @Type(() => OandaTrade)
    trades: OandaTrade[]

    constructor(trades: OandaTrade[]) {
        this.trades = trades
    }
}
