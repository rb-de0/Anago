import Backtest from 'models/trading/core/Backtest'
import TradingResult from 'models/common/TradingResult'

export default class BacktestWithResult {
    backtest: Backtest
    tradingResult: TradingResult | null

    constructor(backtest: Backtest, tradingResult: TradingResult | null) {
        this.backtest = backtest
        this.tradingResult = tradingResult
    }
}
