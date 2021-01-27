import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import moment from 'moment'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import APIError from 'error/APIError'
import BacktestRepository from 'infra/db/repository/BacktestRepository'
import BacktestWithResult from 'models/common/BacktestWithResult'
import TradingResult from 'models/common/TradingResult'
import BacktestProcessLauncher from 'models/trading/backtest/BacktestProcessLauncher'
import Backtest from 'models/trading/core/Backtest'

export default class BacKTestController {
    async startBacktest(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            throw new APIError(400, 'request parameter error', errors.array())
        }
        const param = request.body
        const newBacktest = new Backtest(
            param.name,
            param.description,
            moment(param.startDate).toDate(),
            moment(param.endDate).toDate(),
            param.interval,
            param.balance ?? 1000000,
            param.agent,
            param.instruments,
            param.parameters
        )
        const repository = new BacktestRepository()
        const backtest = await repository.storeBacktest(newBacktest)
        const service = container.get<BacktestProcessLauncher>(TYPES.BacktestProcessLauncher)
        await service.launch(backtest._id.toHexString())
        response.json(backtest)
    }

    async restartBacktest(request: Request, response: Response): Promise<void> {
        const repository = new BacktestRepository()
        const backtest = await repository.loadBacktest(request.params.id)
        await repository.resetStatus(request.params.id)
        const service = container.get<BacktestProcessLauncher>(TYPES.BacktestProcessLauncher)
        await service.launch(backtest._id.toHexString())
        response.json({})
    }

    async getBacktest(request: Request, response: Response): Promise<void> {
        const repository = new BacktestRepository()
        const backtest = await repository.loadBacktest(request.params.id)
        const result = TradingResult.makeFrom(backtest.balance, backtest.positions)
        const withResult = new BacktestWithResult(backtest, result)
        response.json(withResult)
    }

    async getBacktests(_request: Request, response: Response): Promise<void> {
        const repository = new BacktestRepository()
        const backtests = await repository.loadBacktests()
        response.json(backtests)
    }

    async deleteBacktest(request: Request, response: Response): Promise<void> {
        const repository = new BacktestRepository()
        await repository.deleteBacktest(request.params.id)
        response.json({})
    }
}
