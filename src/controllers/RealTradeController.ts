import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import moment from 'moment'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import APIError from 'error/APIError'
import LogRepository from 'infra/db/repository/LogRepository'
import RealTradeRepository from 'infra/db/repository/RealTradeRepository'
import OandaAccountRepository from 'infra/oanda/OandaAccountRepository'
import OandaPositionRepository from 'infra/oanda/OandaPositionRepository'
import OandaAccountService from 'models/trading/common/OandaAccountService'
import Position from 'models/trading/core/Position'
import RealTradeSetting from 'models/trading/core/RealTradeSetting'
import RealTradeProcessLauncher from 'models/trading/realtrade/RealTradeProcessLauncher'
import TradingResult from 'models/common/TradingResult'
import InstrumentSettingRepository from 'infra/db/repository/InstrumentSettingRepository'
import InstrumentSetting from 'models/trading/core/InstrumentSetting'

export default class RealTradeController {
    async getRealTradeSettings(_request: Request, response: Response): Promise<void> {
        const settings = await new RealTradeRepository().loadRealTradeSettings()
        response.json(settings)
    }

    async updateTradeSettings(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            throw new APIError(400, 'request parameter error', errors.array())
        }
        const param = request.body.settings
        const settings: RealTradeSetting[] = []
        for (const p of param) {
            settings.push(new RealTradeSetting(p.agent, p.parameters))
        }
        await new RealTradeRepository().replaceRealTradeSetting(settings)
        container.get<RealTradeProcessLauncher>(TYPES.RealTradeProcessLauncher).launch()
        response.json(settings)
    }

    async getInstrumentSettings(_request: Request, response: Response): Promise<void> {
        const settings = await new InstrumentSettingRepository().loadSettings()
        response.json(settings)
    }

    async updateInstrumentSettings(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            throw new APIError(400, 'request parameter error', errors.array())
        }
        const param = request.body.settings
        const settings: InstrumentSetting[] = []
        for (const p of param) {
            settings.push(new InstrumentSetting(p.name))
        }
        await new InstrumentSettingRepository().replaceSettings(settings)
        container.get<RealTradeProcessLauncher>(TYPES.RealTradeProcessLauncher).launch()
        response.json(settings)
    }

    async getLogs(_request: Request, response: Response): Promise<void> {
        const logs = await new LogRepository().loadLogs()
        const sorted = logs.sort((a, b) => {
            return moment(a.timestamp).isAfter(b.timestamp) ? -1 : 1
        })
        response.json(sorted)
    }

    async getStatus(_request: Request, response: Response): Promise<void> {
        const positions = await RealTradeController.fetchOneWeekPositions()
        const id = container.get<OandaAccountService>(TYPES.OandaAccountService).summary.id
        const summary = new OandaAccountRepository().fetchAccountSummary(id)
        const balance = (await summary).balance
        const result = TradingResult.makeFrom(balance, positions)
        response.json(result)
    }

    static async fetchOneWeekPositions(): Promise<Position[]> {
        const now = moment()
        const limit = now.add(-7, 'days')
        const repository = new OandaPositionRepository()
        let positions: Position[] = []
        let beforeID: string | null = null
        while (true) {
            const pos = await repository.fetchAllStatusPositions(beforeID, 500)
            const trades = pos.trades
            if (trades.length === 0) {
                break
            }
            const converted: Position[] = trades.map((t) => {
                return Position.createFromOanda(t)
            })
            const last = converted[converted.length - 1]
            if (moment(last.entriedAt).isAfter(limit)) {
                break
            }
            beforeID = converted[converted.length - 1].id
            positions = positions.concat(converted)
        }
        const filtered = positions.filter((p) => {
            return moment(p.entriedAt).isSameOrAfter(limit)
        })
        return filtered
    }
}
