import { plainToClass } from 'class-transformer'
import moment from 'moment'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import OandaCandles from 'infra/oanda/entities/OandaCandles'
import OandaAPI from 'infra/oanda/OandaAPI'
import ResponseValidator from 'infra/oanda/validation/ResponseValidator'
import OandaAccountService from 'models/trading/common/OandaAccountService'
import OandaPriceList from 'infra/oanda/entities/OandaPriceList'

export default class OandaTickRepository {
    private readonly context: any

    constructor() {
        this.context = OandaAPI.getInstance().getContext()
    }

    fetchLatestTick(instruments: string[]): Promise<OandaPriceList> {
        const account = container.get<OandaAccountService>(TYPES.OandaAccountService)
        const queryParameters = {
            instruments: instruments.join(','),
        }
        return new Promise((resolve, reject) => {
            this.context.pricing.get(account.summary.id, queryParameters, (res: any) => {
                const error = ResponseValidator.validateTicks(JSON.parse(res.rawBody))
                if (error != null) {
                    reject(error)
                }
                const priceList = plainToClass(OandaPriceList, JSON.parse(res.rawBody) as OandaPriceList)
                resolve(priceList)
            })
        })
    }

    fetchTicks(instrument: string, granularity: string, from: Date, to: Date): Promise<OandaCandles> {
        const queryParameters = {
            price: 'BA',
            granularity: granularity,
            from: moment(from).toISOString(),
            to: moment(to).toISOString(),
            alignmentTimezone: 'Asia/Tokyo',
            dailyAlignment: 0,
        }
        return new Promise((resolve, reject) => {
            this.context.instrument.candles(instrument, queryParameters, (res: any) => {
                const error = ResponseValidator.validateCandles(JSON.parse(res.rawBody))
                if (error != null) {
                    reject(error)
                }
                const candles = plainToClass(OandaCandles, JSON.parse(res.rawBody) as OandaCandles)
                resolve(candles)
            })
        })
    }
}
