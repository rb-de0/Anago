import OandaAccountService from 'models/trading/common/OandaAccountService'
import BacktestService from 'models/trading/backtest/BacktestService'
import Broker from 'models/trading/core/Broker'
import Order, { ModifyOrder, OrderResult } from 'models/trading/core/Order'
import Position from 'models/trading/core/Position'
import ClosingPolicy from 'models/trading/core/ClosingPolicy'
import AccountSummary from 'models/trading/core/AccountSummary'
import container from 'config/inversify.config'
import TYPES from 'config/types'

export default class BacktestBroker implements Broker {
    private service: BacktestService

    constructor(service: BacktestService) {
        this.service = service
    }

    order(order: Order): Promise<OrderResult> {
        return this.service.order(order)
    }

    modifyOrder(order: Order, modifyOrder: ModifyOrder): Promise<void> {
        return this.service.modifyOrder(order.id, modifyOrder)
    }

    cancelOrder(id: string): Promise<void> {
        return this.service.cancelOrder(id)
    }

    modifyPosition(id: string, closingPolicy: ClosingPolicy): Promise<void> {
        return this.service.modifyPosition(id, closingPolicy)
    }

    closePosition(id: string): Promise<void> {
        return this.service.closePosition(id)
    }

    positions(): Promise<Position[]> {
        return Promise.resolve(this.service.getOpenedPositions())
    }

    orders(): Promise<Order[]> {
        return Promise.resolve(this.service.getOrders())
    }

    fetchAccount(): Promise<AccountSummary> {
        const service = container.get<OandaAccountService>(TYPES.OandaAccountService)
        const summary = new AccountSummary(service.summary.balance)
        return Promise.resolve(summary)
    }
}
