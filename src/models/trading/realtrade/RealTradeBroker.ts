import Broker from 'models/trading/core/Broker'
import Order, { ModifyOrder, OrderResult } from 'models/trading/core/Order'
import ClosingPolicy from 'models/trading/core/ClosingPolicy'
import Position from 'models/trading/core/Position'
import OandaPositionRepository from 'infra/oanda/OandaPositionRepository'
import OandaOrderRepository from 'infra/oanda/OandaOrderRepository'
import OandaAccountRepository from 'infra/oanda/OandaAccountRepository'
import container from 'config/inversify.config'
import OandaAccountService from 'models/trading/common/OandaAccountService'
import TYPES from 'config/types'
import AccountSummary from 'models/trading/core/AccountSummary'

export default class RealTradeBroker implements Broker {
    private readonly positionRepository: OandaPositionRepository
    private readonly orderRepository: OandaOrderRepository

    constructor() {
        this.positionRepository = new OandaPositionRepository()
        this.orderRepository = new OandaOrderRepository()
    }

    async order(order: Order): Promise<OrderResult> {
        const result = await this.orderRepository.create(order)
        let position: Position | null
        if (result.orderFillTransaction?.tradeOpened == null) {
            position = null
        } else {
            const trade = await this.positionRepository.fetchPosition(result.orderFillTransaction.tradeOpened.tradeID)
            position = Position.createFromOanda(trade)
        }
        return OrderResult.makeFromOanda(result, position)
    }

    modifyOrder(order: Order, modifyOrder: ModifyOrder): Promise<void> {
        return this.orderRepository.modify(order, modifyOrder)
    }

    cancelOrder(id: string): Promise<void> {
        return this.orderRepository.cancel(id)
    }

    modifyPosition(id: string, closingPolicy: ClosingPolicy): Promise<void> {
        return this.positionRepository.modify(id, closingPolicy)
    }

    closePosition(id: string): Promise<void> {
        return this.positionRepository.close(id)
    }

    async positions(): Promise<Position[]> {
        const response = await this.positionRepository.fetchOpenPositions()
        const positions = response.trades
        const covertedPositions = positions.map((p) => {
            return Position.createFromOanda(p)
        })
        return covertedPositions
    }

    async orders(): Promise<Order[]> {
        const response = await this.orderRepository.fetchPendingOrders()
        const orders = response.orders
        const convertedOrders = orders
            .map((o) => {
                return Order.createFromOanda(o)
            })
            .filter((o): o is Order => {
                return o != null
            })
        return convertedOrders
    }

    async fetchAccount(): Promise<AccountSummary> {
        const service = container.get<OandaAccountService>(TYPES.OandaAccountService)
        const repository = new OandaAccountRepository()
        const summary = await repository.fetchAccountSummary(service.summary.id)
        return new AccountSummary(summary.balance)
    }
}
