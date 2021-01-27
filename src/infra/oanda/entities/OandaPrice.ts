import { Transform, Type } from 'class-transformer'

export default class OandaPrice {
    instrument: string
    @Type(() => OandaPriceValue)
    bids: OandaPriceValue[]
    @Type(() => OandaPriceValue)
    asks: OandaPriceValue[]
    tradeable: boolean

    constructor(instrument: string, bids: OandaPriceValue[], asks: OandaPriceValue[], tradeable: boolean) {
        this.instrument = instrument
        this.bids = bids
        this.asks = asks
        this.tradeable = tradeable
    }
}

export class OandaPriceValue {
    @Transform((value) => {
        return parseFloat(value)
    })
    price: number

    constructor(price: number) {
        this.price = price
    }
}
