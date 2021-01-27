import { Transform, Type } from 'class-transformer'
import { OandaStopLossOrder, OandaTakeProfitOrder, OandaTrailingStopLossOrder } from 'infra/oanda/entities/OandaClosingPolicy'

export default class OandaOrderResult {
    orderCreateTransaction: OrderCreateTransaction | null
    orderFillTransaction: OrderFillTransaction | null

    constructor(orderCreateTransaction: OrderCreateTransaction | null, orderFillTransaction: OrderFillTransaction | null) {
        this.orderCreateTransaction = orderCreateTransaction
        this.orderFillTransaction = orderFillTransaction
    }
}

export class OrderCreateTransaction {
    id: string
    instrument: string
    type: string
    @Transform((value) => {
        return parseFloat(value)
    })
    units: number
    time: string
    @Transform((value) => {
        return value != null ? parseFloat(value) : null
    })
    price: number | null
    gtdTime: string | null
    timeInForce: string | null
    @Type(() => OandaTakeProfitOrder)
    takeProfitOnFill: OandaTakeProfitOrder | null
    @Type(() => OandaStopLossOrder)
    stopLossOnFill: OandaStopLossOrder | null
    @Type(() => OandaTrailingStopLossOrder)
    trailingStopLossOnFill: OandaTrailingStopLossOrder | null

    constructor(
        id: string,
        instrument: string,
        type: string,
        units: number,
        time: string,
        price: number | null,
        gtdTime: string | null,
        timeInForce: string | null,
        takeProfitOnFill: OandaTakeProfitOrder | null,
        stopLossOnFill: OandaStopLossOrder | null,
        trailingStopLossOnFill: OandaTrailingStopLossOrder | null
    ) {
        this.id = id
        this.instrument = instrument
        this.type = type
        this.units = units
        this.time = time
        this.price = price
        this.gtdTime = gtdTime
        this.timeInForce = timeInForce
        this.takeProfitOnFill = takeProfitOnFill
        this.stopLossOnFill = stopLossOnFill
        this.trailingStopLossOnFill = trailingStopLossOnFill
    }
}

export class OrderFillTransaction {
    time: string
    @Type(() => OpenedTrade)
    tradeOpened: OpenedTrade | null
    @Type(() => ReducedTrade)
    tradeReduced: ReducedTrade | null
    @Type(() => ClosedTrade)
    tradesClosed: ClosedTrade[] | null

    constructor(time: string, tradeOpened: OpenedTrade | null, tradeReduced: ReducedTrade | null, tradesClosed: ClosedTrade[] | null) {
        this.time = time
        this.tradeOpened = tradeOpened
        this.tradeReduced = tradeReduced
        this.tradesClosed = tradesClosed
    }
}

export class OpenedTrade {
    tradeID: string

    constructor(tradeID: string) {
        this.tradeID = tradeID
    }
}

export class ReducedTrade {
    tradeID: string
    @Transform((value) => {
        return parseFloat(value)
    })
    price: number
    @Transform((value) => {
        return parseFloat(value)
    })
    units: number

    constructor(tradeID: string, price: number, units: number) {
        this.tradeID = tradeID
        this.price = price
        this.units = units
    }
}

export class ClosedTrade {
    tradeID: string
    @Transform((value) => {
        return parseFloat(value)
    })
    price: number
    @Transform((value) => {
        return parseFloat(value)
    })
    units: number

    constructor(tradeID: string, price: number, units: number) {
        this.tradeID = tradeID
        this.price = price
        this.units = units
    }
}
