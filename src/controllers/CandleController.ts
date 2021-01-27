import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import moment from 'moment'
import OandaTickRepository from 'infra/oanda/OandaTickRepository'
import APIError from 'error/APIError'

export default class CandleController {
    async getCandleSticks(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            throw new APIError(400, 'request parameter error', errors.array())
        }
        const from = request.query.from as string
        const to = request.query.to as string
        const instrument = request.query.instrument as string
        const interval = request.query.interval as string
        const repository = new OandaTickRepository()
        const candles = await repository.fetchTicks(instrument, interval, moment(from).toDate(), moment(to).toDate())
        response.json(candles)
    }
}
