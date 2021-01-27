import { Type } from 'class-transformer'
import BacktestEntity from 'models/responses/BacktestEntity'
import TradingResultEntity from 'models/responses/TradingResultEntity'

export default class BacktestWithResult {
    @Type(() => BacktestEntity)
    backtest: BacktestEntity
    @Type(() => TradingResultEntity)
    tradingResult: TradingResultEntity | null

    constructor(backtest: BacktestEntity, tradingResult: TradingResultEntity | null) {
        this.backtest = backtest
        this.tradingResult = tradingResult
    }
}
