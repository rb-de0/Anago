import OandaPrice from 'infra/oanda/entities/OandaPrice'

export default class OandaPriceList {
    prices: OandaPrice[]

    constructor(prices: OandaPrice[]) {
        this.prices = prices
    }
}
