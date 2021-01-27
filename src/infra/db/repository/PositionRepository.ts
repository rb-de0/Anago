import Position from 'models/trading/core/Position'
import { BacktestModel } from 'infra/db/schema/BacktestSchema'

export default class PositionRepository {
    private readonly backtestId: string

    constructor(backtestId: string) {
        this.backtestId = backtestId
    }

    async pushPosition(position: Position) {
        const backtest = await BacktestModel.findById(this.backtestId).exec()
        backtest?.positions.push(position)
        await backtest?.save()
    }

    async updatePosition(position: Position) {
        await BacktestModel.findOneAndUpdate(
            { _id: this.backtestId, 'positions._id': position._id },
            {
                $set: {
                    'positions.$.units': position.units,
                    'positions.$.price': position.price,
                    'positions.$.updatedAt': position.updatedAt,
                    'positions.$.counterRate': position.counterRate,
                    'positions.$.profitOrLoss': position.profitOrLoss,
                    'positions.$.closePrice': position.closePrice,
                    'positions.$.closingPolicy': position.closingPolicy,
                    'positions.$.closedAt': position.closedAt,
                    'positions.$.status': position.status,
                },
            }
        )
    }
}
