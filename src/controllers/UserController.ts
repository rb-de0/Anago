import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import APIError from 'error/APIError'
import UserRepository from 'infra/db/repository/UserRepository'

export default class UserController {
    async getInstrument(_request: Request, response: Response): Promise<void> {
        const users = await new UserRepository().loadUsers()
        if (users.length === 0) {
            throw new APIError(500, 'internal server error', null)
        }
        const json = {
            instrument: users[0].lastSelectedInstrument,
        }
        response.json(json)
    }

    async updateInstrument(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            throw new APIError(400, 'request parameter error', errors.array())
        }
        const users = await new UserRepository().loadUsers()
        if (users.length === 0) {
            throw new APIError(500, 'internal server error', null)
        }
        const param = request.body
        const instrument = param.instrument
        await new UserRepository().updateSelectedInstrument(users[0], instrument)
        response.json({})
    }
}
