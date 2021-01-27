import OandaCandleStickData from 'infra/oanda/entities/OandaCandleStickData'

export default class OandaCandleStick {
    bid: OandaCandleStickData
    ask: OandaCandleStickData
    time: string
    volume: number

    constructor(bid: OandaCandleStickData, ask: OandaCandleStickData, time: string, volume: number) {
        this.bid = bid
        this.ask = ask
        this.time = time
        this.volume = volume
    }
}
