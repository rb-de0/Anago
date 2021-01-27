import { Transform, Type } from 'class-transformer'
import { OandaStopLossOrder, OandaTakeProfitOrder, OandaTrailingStopLossOrder } from 'infra/oanda/entities/OandaClosingPolicy'

export default class OandaTrade {
    id: string
    instrument: string
    @Transform((value) => {
        return parseFloat(value)
    })
    price: number
    openTime: string
    @Transform((value) => {
        return parseFloat(value)
    })
    initialUnits: number
    @Transform((value) => {
        return parseFloat(value)
    })
    currentUnits: number
    state: string
    @Transform((value) => {
        return parseFloat(value)
    })
    realizedPL: number
    @Transform((value) => {
        return value != null ? parseFloat(value) : null
    })
    unrealizedPL: number | null
    @Transform((value) => {
        return value != null ? parseFloat(value) : null
    })
    averageClosePrice: number | null
    closeTime: string | null
    @Type(() => OandaTakeProfitOrder)
    takeProfitOrder: OandaTakeProfitOrder | null
    @Type(() => OandaStopLossOrder)
    stopLossOrder: OandaStopLossOrder | null
    @Type(() => OandaTrailingStopLossOrder)
    trailingStopLossOrder: OandaTrailingStopLossOrder | null

    constructor(
        id: string,
        instrument: string,
        price: number,
        openTime: string,
        initialUnits: number,
        currentUnits: number,
        state: string,
        realizedPL: number,
        unrealizedPL: number | null,
        averageClosePrice: number | null,
        closeTime: string | null,
        takeProfitOrder: OandaTakeProfitOrder | null,
        stopLossOrder: OandaStopLossOrder | null,
        trailingStopLossOrder: OandaTrailingStopLossOrder | null
    ) {
        this.id = id
        this.instrument = instrument
        this.price = price
        this.openTime = openTime
        this.initialUnits = initialUnits
        this.currentUnits = currentUnits
        this.state = state
        this.realizedPL = realizedPL
        this.unrealizedPL = unrealizedPL
        this.averageClosePrice = averageClosePrice
        this.closeTime = closeTime
        this.takeProfitOrder = takeProfitOrder
        this.stopLossOrder = stopLossOrder
        this.trailingStopLossOrder = trailingStopLossOrder
    }
}
