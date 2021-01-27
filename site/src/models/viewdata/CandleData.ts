import moment from 'moment'
import CandlesEntity from 'models/responses/CandlesEntity'

export default class CandleData {
    x: Date
    y: number[]

    constructor(x: Date, y: number[]) {
        this.x = x
        this.y = y
    }

    static makeFrom(candles: CandlesEntity): CandleData[] {
        return candles.candles.map((c) => {
            return new CandleData(moment(c.time).toDate(), [c.ask.o, c.ask.h, c.ask.l, c.ask.c])
            c.ask
        })
    }
}
