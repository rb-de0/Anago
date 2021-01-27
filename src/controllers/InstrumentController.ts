import { Request, Response } from 'express'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import OandaPairRepository from 'infra/oanda/OandaPairRepository'
import OandaAccountService from 'models/trading/common/OandaAccountService'
import OandaInstruments from 'infra/oanda/entities/OandaInstruments'

export default class InstrumentController {
    async getInstruments(_request: Request, response: Response): Promise<void> {
        const oandaAccountService = container.get<OandaAccountService>(TYPES.OandaAccountService)
        const instruments = await new OandaPairRepository().fetchInstruments(oandaAccountService.summary.id)
        const sorted = instruments.instruments.sort((a, b) => {
            return a.name < b.name ? -1 : 1
        })
        const sortedResponse = new OandaInstruments(sorted)
        response.json(sortedResponse)
    }
}
