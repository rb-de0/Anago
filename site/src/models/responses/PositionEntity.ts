import { Type } from 'class-transformer'
import ClosingPolicyEntity from 'models/responses/ClosingPolicyEntity'

export default class PositionEntity {
    readonly id: string
    readonly _id: string
    readonly instrument: string
    readonly sellOrBuy: string
    readonly units: number
    readonly price: number | null
    readonly entryPrice: number
    @Type(() => Date)
    readonly entriedAt: Date
    @Type(() => Date)
    readonly updatedAt: Date | null
    readonly closePrice: number | null
    @Type(() => Date)
    readonly closedAt: Date | null
    readonly profitOrLoss: number | null
    @Type(() => ClosingPolicyEntity)
    readonly closingPolicy: ClosingPolicyEntity | null
    readonly status: string

    constructor(
        id: string,
        _id: string,
        instrument: string,
        sellOrBuy: string,
        units: number,
        price: number | null,
        entryPrice: number,
        entriedAt: Date,
        updatedAt: Date | null,
        closePrice: number | null,
        closedAt: Date | null,
        profitOrLoss: number | null,
        closingPolicy: ClosingPolicyEntity | null,
        status: string
    ) {
        this.id = id
        this._id = _id
        this.instrument = instrument
        this.sellOrBuy = sellOrBuy
        this.units = units
        this.price = price
        this.entryPrice = entryPrice
        this.entriedAt = entriedAt
        this.updatedAt = updatedAt
        this.closePrice = closePrice
        this.closedAt = closedAt
        this.profitOrLoss = profitOrLoss
        this.closingPolicy = closingPolicy
        this.status = status
    }
}
