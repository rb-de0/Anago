import OandaOrder from 'infra/oanda/entities/OandaOrder'

export default class OandaOrderList {
    orders: OandaOrder[]

    constructor(orders: OandaOrder[]) {
        this.orders = orders
    }
}
