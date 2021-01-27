import OandaCandleStick from 'infra/oanda/entities/OandaCandleStick'

export default class OandaCandles {
    instrument: string
    granularity: string
    candles: OandaCandleStick[]

    constructor(instrument: string, granularity: string, candles: OandaCandleStick[]) {
        this.instrument = instrument
        this.granularity = granularity
        this.candles = candles
    }
}
