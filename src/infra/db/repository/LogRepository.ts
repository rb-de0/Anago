import { plainToClass } from 'class-transformer'
import { LogModel } from 'infra/db/schema/LogSchema'
import Log from 'models/trading/core/Log'

export default class LogRepository {
    async loadLogs(): Promise<Log[]> {
        const backtests = await LogModel.find()
            .lean<Log>()
            .exec()
            .then((r) => {
                return plainToClass(Log, r as Log[])
            })
        return backtests
    }

    async storeLog(log: Log): Promise<Log> {
        await new LogModel(log).save()
        return log
    }
}
