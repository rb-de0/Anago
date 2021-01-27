import { plainToClass } from 'class-transformer'
import { TradingStatusModel } from 'infra/db/schema/TradingStatusSchema'
import TradingStatus from 'models/trading/core/TradingStatus'

export default class TradingStatusRepository {
    async loadTradingStatus(): Promise<TradingStatus | null> {
        const statuses = await TradingStatusModel.find()
            .lean<TradingStatus>()
            .exec()
            .then((r) => {
                return plainToClass(TradingStatus, r as TradingStatus[])
            })
        return statuses.length > 0 ? statuses[0] : null
    }

    async replaceTradingStatus(status: TradingStatus): Promise<TradingStatus> {
        await TradingStatusModel.deleteMany({}).exec()
        await new TradingStatusModel(status).save()
        return status
    }
}
