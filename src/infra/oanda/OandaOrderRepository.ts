import { plainToClass } from 'class-transformer'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import OandaAPI from 'infra/oanda/OandaAPI'
import ResponseValidator from 'infra/oanda/validation/ResponseValidator'
import OandaAccountService from 'models/trading/common/OandaAccountService'
import Order, { ModifyOrder } from 'models/trading/core/Order'
import OandaOrderList from 'infra/oanda/entities/OandaOrderList'
import OandaOrderResult from 'infra/oanda/entities/OandaOrderResult'
import OrderUtil from 'models/trading/utils/OrderUtil'

export default class OandaOrderRepository {
    private readonly context: any

    constructor() {
        this.context = OandaAPI.getInstance().getContext()
    }

    fetchAllStatusOrder(lastId: string | null): Promise<OandaOrderList> {
        const account = container.get<OandaAccountService>(TYPES.OandaAccountService)
        const params: any = {
            state: 'ALL',
            count: 500,
        }
        if (lastId != null) {
            params.beforeID = lastId
        }
        return new Promise((resolve, reject) => {
            this.context.order.list(account.summary.id, params, (res: any) => {
                const error = ResponseValidator.validateOrders(JSON.parse(res.rawBody))
                if (error != null) {
                    reject(error)
                }
                const tradeList = plainToClass(OandaOrderList, JSON.parse(res.rawBody) as OandaOrderList)
                resolve(tradeList)
            })
        })
    }

    fetchPendingOrders(): Promise<OandaOrderList> {
        const account = container.get<OandaAccountService>(TYPES.OandaAccountService)
        return new Promise((resolve, reject) => {
            this.context.order.listPending(account.summary.id, (res: any) => {
                const error = ResponseValidator.validateOrders(JSON.parse(res.rawBody))
                if (error != null) {
                    reject(error)
                }
                const tradeList = plainToClass(OandaOrderList, JSON.parse(res.rawBody) as OandaOrderList)
                resolve(tradeList)
            })
        })
    }

    create(order: Order): Promise<OandaOrderResult> {
        const account = container.get<OandaAccountService>(TYPES.OandaAccountService)
        const units = order.sellOrBuy === 'Sell' ? -order.units : order.units
        const type = OrderUtil.convertToOanda(order.type)
        const orderParam: any = {
            type: type,
            instrument: order.instrument,
            units: units,
        }
        if (order.price != null) {
            orderParam.price = order.price.toString()
        }
        if (order.timeInForce != null) {
            orderParam.timeInForce = order.timeInForce
        }
        if (order.gtdTime != null) {
            orderParam.gtdTime = order.gtdTime
        }
        if (order.takeProfitOnFill != null) {
            orderParam.takeProfitOnFill = {
                price: order.takeProfitOnFill.price.toString(),
            }
        }
        if (order.stopLossOnFill != null) {
            orderParam.stopLossOnFill = {
                price: order.stopLossOnFill.price.toString(),
            }
        }
        if (order.trailingStopLossOnFill?.distance != null) {
            orderParam.trailingStopLossOnFill = {
                distance: order.trailingStopLossOnFill.distance.toString(),
            }
        }
        const params = {
            order: orderParam,
        }
        return new Promise((resolve, reject) => {
            this.context.order.create(account.summary.id, params, (res: any) => {
                const errorMessage = JSON.parse(res.rawBody).errorMessage
                if (errorMessage != null) {
                    reject(errorMessage)
                } else {
                    const error = ResponseValidator.validateOrderResult(JSON.parse(res.rawBody))
                    if (error != null) {
                        reject(error)
                    }
                    const result = plainToClass(OandaOrderResult, JSON.parse(res.rawBody) as OandaOrderResult)
                    resolve(result)
                }
            })
        })
    }

    modify(order: Order, modifyOrder: ModifyOrder): Promise<void> {
        const account = container.get<OandaAccountService>(TYPES.OandaAccountService)
        const type = OrderUtil.convertToOanda(order.type)
        const orderParam: any = {
            type: type,
            instrument: order.instrument,
        }
        const units = modifyOrder.units ?? order.units
        if (units != null) {
            const unitsParam = order.sellOrBuy === 'Sell' ? -units : units
            orderParam.units = unitsParam
        }
        const price = modifyOrder.price ?? order.price
        if (price != null) {
            orderParam.price = price.toString()
        }
        if (modifyOrder.timeInForce != null) {
            orderParam.timeInForce = modifyOrder.timeInForce
        }
        if (modifyOrder.gtdTime != null) {
            orderParam.gtdTime = modifyOrder.gtdTime
        }
        if (modifyOrder.takeProfitOnFill != null) {
            orderParam.takeProfitOnFill = {
                price: modifyOrder.takeProfitOnFill.price.toString(),
            }
        }
        if (modifyOrder.stopLossOnFill != null) {
            orderParam.stopLossOnFill = {
                price: modifyOrder.stopLossOnFill.price.toString(),
            }
        }
        if (modifyOrder.trailingStopLossOnFill?.distance != null) {
            orderParam.trailingStopLossOnFill = {
                distance: modifyOrder.trailingStopLossOnFill.distance.toString(),
            }
        }
        const params: any = {
            order: orderParam,
        }
        return new Promise((resolve, reject) => {
            this.context.order.replace(account.summary.id, order.id, params, (res: any) => {
                const errorMessage = JSON.parse(res.rawBody).errorMessage
                if (errorMessage != null) {
                    reject(errorMessage)
                } else {
                    resolve()
                }
            })
        })
    }

    cancel(id: string): Promise<void> {
        const account = container.get<OandaAccountService>(TYPES.OandaAccountService)
        return new Promise((resolve, reject) => {
            this.context.order.cancel(account.summary.id, id, (res: any) => {
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
