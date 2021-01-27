import { plainToClass } from 'class-transformer'
import OandaInstruments from 'infra/oanda/entities/OandaInstruments'
import OandaAPI from 'infra/oanda/OandaAPI'
import ResponseValidator from 'infra/oanda/validation/ResponseValidator'

export default class OandaPairRepository {
    private readonly context: any

    constructor() {
        this.context = OandaAPI.getInstance().getContext()
    }

    fetchInstruments(account: string): Promise<OandaInstruments> {
        return new Promise((resolve, reject) => {
            this.context.account.instruments(account, {}, (res: any) => {
                const error = ResponseValidator.validateInstruments(JSON.parse(res.rawBody))
                if (error != null) {
                    reject(error)
                }
                const instruments = plainToClass(OandaInstruments, JSON.parse(res.rawBody) as OandaInstruments)
                resolve(instruments)
            })
        })
    }
}
