export default class ClosingPolicyEntity {
    readonly takeProfitPrice: number | null
    readonly stopLossPrice: number | null
    readonly trailingStopDistance: number | null
    readonly trailingStopPrice: number | null

    constructor(
        takeProfitPrice: number | null,
        stopLossPrice: number | null,
        trailingStopDistance: number | null,
        trailingStopPrice: number | null
    ) {
        this.takeProfitPrice = takeProfitPrice
        this.stopLossPrice = stopLossPrice
        this.trailingStopDistance = trailingStopDistance
        this.trailingStopPrice = trailingStopPrice
    }
}
