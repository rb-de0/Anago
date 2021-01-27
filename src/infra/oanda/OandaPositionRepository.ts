import { plainToClass } from 'class-transformer'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import OandaAPI from 'infra/oanda/OandaAPI'
import ResponseValidator from 'infra/oanda/validation/ResponseValidator'
import OandaAccountService from 'models/trading/common/OandaAccountService'
import ClosingPolicy from 'models/trading/core/ClosingPolicy'
import OandaTradeList from 'infra/oanda/entities/OandaTradeList'
import OandaTrade from 'infra/oanda/entities/OandaTrade'

export default class OandaPositionRepository {
    private readonly context: any

    constructor() {
        this.context = OandaAPI.getInstance().getContext()
    }

    fetchAllStatusPositions(lastId: string | null, count: number): Promise<OandaTradeList> {
        const account = container.get<OandaAccountService>(TYPES.OandaAccountService)
        const params: any = {
            state: 'ALL',
            count: count,
        }
        if (lastId != null) {
            params.beforeID = lastId
        }
        return new Promise((resolve, reject) => {
            this.context.trade.list(account.summary.id, params, (res: any) => {
                const error = ResponseValidator.validateTrades(JSON.parse(res.rawBody))
                if (error != null) {
                    reject(error)
                }
                const tradeList = plainToClass(OandaTradeList, JSON.parse(res.rawBody) as OandaTradeList)
                resolve(tradeList)
            })
        })
    }

    fetchOpenPositions(): Promise<OandaTradeList> {
        const account = container.get<OandaAccountService>(TYPES.OandaAccountService)
        return new Promise((resolve, reject) => {
            this.context.trade.listOpen(account.summary.id, (res: any) => {
                const error = ResponseValidator.validateTrades(JSON.parse(res.rawBody))
                if (error != null) {
                    reject(error)
                }
                const tradeList = plainToClass(OandaTradeList, JSON.parse(res.rawBody) as OandaTradeList)
                resolve(tradeList)
            })
        })
    }

    fetchPosition(id: string): Promise<OandaTrade> {
        const account = container.get<OandaAccountService>(TYPES.OandaAccountService)
        return new Promise((resolve, reject) => {
            this.context.trade.get(account.summary.id, id, (res: any) => {
                const error = ResponseValidator.validateTrade(JSON.parse(res.rawBody))
                if (error != null) {
                    reject(error)
                }
                const trade = plainToClass(OandaTrade, JSON.parse(res.rawBody).trade as OandaTrade)
                resolve(trade)
            })
        })
    }

    modify(id: string, closingPolicy: ClosingPolicy): Promise<void> {
        const account = container.get<OandaAccountService>(TYPES.OandaAccountService)
        const params: any = {}
        if (closingPolicy.takeProfitPrice != null) {
            params.takeProfit = {
                price: closingPolicy.takeProfitPrice.toString(),
            }
        }
        if (closingPolicy.stopLossPrice != null) {
            params.stopLoss = {
                price: closingPolicy.stopLossPrice.toString(),
            }
        }
        if (closingPolicy.trailingStopDistance != null) {
            params.trailingStopLoss = {
                distance: closingPolicy.trailingStopDistance.toString(),
            }
        }
        return new Promise((resolve, reject) => {
            this.context.trade.setDependentOrders(account.summary.id, id, params, (res: any) => {
                console.log(res)
                const errorMessage = JSON.parse(res.rawBody).errorMessage
                if (errorMessage != null) {
                    reject(errorMessage)
                } else {
                    resolve()
                }
            })
        })
    }

    close(id: string): Promise<void> {
        const account = container.get<OandaAccountService>(TYPES.OandaAccountService)
        return new Promise((resolve, reject) => {
            this.context.trade.close(account.summary.id, id, {}, (res: any) => {
                const errorMessage = JSON.parse(res.rawBody).errorMessage
                if (errorMessage != null) {
                    reject(errorMessage)
                } else {
                    resolve()
                }
            })
        })
    }
}
