import { Transform } from 'class-transformer'

export class OandaTakeProfitOrder {
    @Transform((value) => {
        return parseFloat(value)
    })
    price: number

    constructor(price: number) {
        this.price = price
    }
}

export class OandaStopLossOrder {
    @Transform((value) => {
        return value != null ? parseFloat(value) : null
    })
    price: number | null
    @Transform((value) => {
        return value != null ? parseFloat(value) : null
    })
    distance: number | null

    constructor(price: number | null, distance: number | null) {
        this.price = price
        this.distance = distance
    }
}

export class OandaTrailingStopLossOrder {
    @Transform((value) => {
        return parseFloat(value)
    })
    distance: number

    constructor(distance: number) {
        this.distance = distance
    }
}
