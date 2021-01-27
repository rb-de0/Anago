import { Type } from 'class-transformer'
import CandleStickValueEntity from 'models/responses/CandleStickValueEntity'

export default class CandleStickEntity {
    @Type(() => CandleStickValueEntity)
    bid: CandleStickValueEntity
    @Type(() => CandleStickValueEntity)
    ask: CandleStickValueEntity
    time: string
    volume: number

    constructor(bid: CandleStickValueEntity, ask: CandleStickValueEntity, time: string, volume: number) {
        this.bid = bid
        this.ask = ask
        this.time = time
        this.volume = volume
    }
}
