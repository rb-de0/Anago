import moment from 'moment'
import PositionEntity from 'models/responses/PositionEntity'
import ClosingPolicyEntity from 'models/responses/ClosingPolicyEntity'

export default class PositionTableData {
    id: string
    profitOrLoss: number | null
    status: string
    instrument: string
    sellOrBuy: string
    units: number
    entryPrice: number
    closePrice: number | null
    entriedAt: string
    closedAt: string | null
    closingPolicy: ClosingPolicyEntity | null

    constructor(position: PositionEntity) {
        this.id = position._id
        if (position.profitOrLoss == null) {
            this.profitOrLoss = null
        } else {
            const multiplied = position.profitOrLoss * Math.pow(10, 2)
            this.profitOrLoss = Math.round(multiplied) / Math.pow(10, 2)
        }
        this.status = position.status == 'Live' ? '未決済' : '決済済み'
        this.instrument = position.instrument
        this.sellOrBuy = position.sellOrBuy == 'Buy' ? '買' : '売'
        this.units = position.units
        this.entryPrice = position.entryPrice
        this.closePrice = position.closePrice
        this.entriedAt = moment(position.entriedAt).format('YYYY-MM-DD HH:mm:ss')
        this.closedAt = position.closedAt != null ? moment(position.closedAt).format('YYYY-MM-DD HH:mm:ss') : null
        this.closingPolicy = position.closingPolicy
    }
}
