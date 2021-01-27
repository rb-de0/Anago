import { Transform, Type } from 'class-transformer'
import { OandaStopLossOrder, OandaTakeProfitOrder, OandaTrailingStopLossOrder } from 'infra/oanda/entities/OandaClosingPolicy'

export default class OandaOrder {
    id: string
    createTime: string
    state: string
    type: string
    instrument: string | null
    @Transform((value) => {
        return value != null ? parseFloat(value) : null
    })
    units: number | null
    @Transform((value) => {
        return value != null ? parseFloat(value) : null
    })
    price: number | null
    timeInForce: string | null
    gtdTime: string | null
    @Type(() => OandaTakeProfitOrder)
    takeProfitOnFill: OandaTakeProfitOrder | null
    @Type(() => OandaStopLossOrder)
    stopLossOnFill: OandaStopLossOrder | null
    @Type(() => OandaTrailingStopLossOrder)
    trailingStopLossOnFill: OandaTrailingStopLossOrder | null

    constructor(
        id: string,
        createTime: string,
        state: string,
        type: string,
        instrument: string | null,
        units: number | null,
        price: number | null,
        timeInForce: string | null,
        gtdTime: string | null,
        takeProfitOnFill: OandaTakeProfitOrder | null,
        stopLossOnFill: OandaStopLossOrder | null,
        trailingStopLossOnFill: OandaTrailingStopLossOrder | null
    ) {
        this.id = id
        this.createTime = createTime
        this.state = state
        this.type = type
        this.instrument = instrument
        this.units = units
        this.price = price
        this.timeInForce = timeInForce
        this.gtdTime = gtdTime
        this.takeProfitOnFill = takeProfitOnFill
        this.stopLossOnFill = stopLossOnFill
        this.trailingStopLossOnFill = trailingStopLossOnFill
    }
}
