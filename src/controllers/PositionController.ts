import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { Position } from 'core/Model'
import APIError from 'error/APIError'
import OandaPositionRepository from 'infra/oanda/OandaPositionRepository'

export default class PositionController {
    async getPositions(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            throw new APIError(400, 'request parameter error', errors.array())
        }
        const lastId = request.query.lastId as string
        const trades = await new OandaPositionRepository().fetchAllStatusPositions(lastId, 30)
        const positions = trades.trades
        const covertedPositions = positions.map((p) => {
            return Position.createFromOanda(p)
        })
        response.json(covertedPositions)
    }
}
