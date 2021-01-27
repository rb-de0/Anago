import { Type } from 'class-transformer'
import CandleStickEntity from 'models/responses/CandleStickEntity'

export default class CandlesEntity {
    instrument: string
    granularity: string
    @Type(() => CandleStickEntity)
    candles: CandleStickEntity[]

    constructor(instrument: string, granularity: string, candles: CandleStickEntity[]) {
        this.instrument = instrument
        this.granularity = granularity
        this.candles = candles
    }
}
