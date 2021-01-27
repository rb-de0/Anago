import { plainToClass } from 'class-transformer'
import { BacktestModel } from 'infra/db/schema/BacktestSchema'
import Backtest, { BacktestStatus } from 'models/trading/core/Backtest'
import Log from 'models/trading/core/Log'

export default class BacktestRepository {
    async storeBacktest(backtest: Backtest): Promise<Backtest> {
        await new BacktestModel(backtest).save()
        return backtest
    }

    async updateStatus(id: string, status: BacktestStatus) {
        await BacktestModel.findByIdAndUpdate(id, {
            status: status,
        })
    }

    async updateProgress(id: string, proceeded: Date) {
        await BacktestModel.findByIdAndUpdate(id, {
            proceeded: proceeded,
        })
    }

    async resetStatus(id: string) {
        await BacktestModel.findByIdAndUpdate(id, {
            status: 'Preparing',
            proceeded: null,
            logs: [],
            positions: [],
            graphs: [],
        })
    }

    async pushLog(id: string, log: Log) {
        const backtest = await BacktestModel.findById(id).exec()
        backtest?.logs.push(log)
        await backtest?.save()
    }

    async loadBacktest(id: string): Promise<Backtest> {
        const backtest = await BacktestModel.findById(id)
            .lean<Backtest>()
            .exec()
            .then((r) => {
                return plainToClass(Backtest, r as Backtest)
            })
        return backtest
    }

    async loadBacktests(): Promise<Backtest[]> {
        const backtests = await BacktestModel.find()
            .lean<Backtest>()
            .exec()
            .then((r) => {
                return plainToClass(Backtest, r as Backtest[])
            })
        return backtests
    }

    async deleteBacktest(id: string): Promise<void> {
        await BacktestModel.findByIdAndDelete(id)
    }
}
