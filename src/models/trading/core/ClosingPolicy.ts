import Order from 'models/trading/core/Order'
import Pair from 'models/trading/core/Pair'
import Position from 'models/trading/core/Position'
import { ClosingPolicyDocument } from 'infra/db/schema/ClosingPolicySchema'
import OandaTrade from 'infra/oanda/entities/OandaTrade'

export default class ClosingPolicy implements ClosingPolicyDocument {
    takeProfitPrice: number | null = null
    stopLossPrice: number | null = null
    trailingStopDistance: number | null = null
    trailingStopPrice: number | null = null

    static createFromOrder(order: Order): ClosingPolicy {
        const policy = new ClosingPolicy()
        if (order.takeProfitOnFill != null) {
            policy.takeProfitPrice = order.takeProfitOnFill.price
        }
        if (order.stopLossOnFill != null) {
            policy.stopLossPrice = order.stopLossOnFill.price
        }
        if (order.trailingStopLossOnFill != null) {
            policy.trailingStopDistance = order.trailingStopLossOnFill.distance
            policy.trailingStopPrice = order.trailingStopLossOnFill.price
        }
        return policy
    }

    static createFromTrade(trade: OandaTrade): ClosingPolicy {
        const policy = new ClosingPolicy()
        if (trade.takeProfitOrder != null) {
            policy.takeProfitPrice = trade.takeProfitOrder.price
        }
        if (trade.stopLossOrder != null) {
            policy.stopLossPrice = trade.stopLossOrder.price
        }
        if (trade.trailingStopLossOrder != null) {
            policy.trailingStopDistance = trade.trailingStopLossOrder.distance
            policy.trailingStopPrice = null
        }
        return policy
    }

    updatePrice(position: Position, pair: Pair) {
        if (this.trailingStopDistance == null) {
            return
        }
        if (position.price == null) {
            return
        }
        const amount = pair.pip * this.trailingStopDistance
        if (position.sellOrBuy === 'Buy') {
            const newPrice = position.price - amount
            if (this.trailingStopPrice == null) {
                this.trailingStopPrice = newPrice
            } else {
                this.trailingStopPrice = this.trailingStopPrice < newPrice ? newPrice : this.trailingStopPrice
            }
        } else {
            const newPrice = position.price + amount
            if (this.trailingStopPrice == null) {
                this.trailingStopPrice = newPrice
            } else {
                this.trailingStopPrice = this.trailingStopPrice > newPrice ? newPrice : this.trailingStopPrice
            }
        }
    }

    shouldClose(position: Position): boolean {
        if (position.price == null) {
            return false
        }
        if (this.takeProfitPrice != null) {
            if (position.sellOrBuy === 'Buy' && position.price >= this.takeProfitPrice) {
                return true
            } else if (position.sellOrBuy === 'Sell' && position.price <= this.takeProfitPrice) {
                return true
            }
        }
        if (this.stopLossPrice != null) {
            if (position.sellOrBuy === 'Buy' && position.price <= this.stopLossPrice) {
                return true
            } else if (position.sellOrBuy === 'Sell' && position.price >= this.stopLossPrice) {
                return true
            }
        }
        if (this.trailingStopPrice != null) {
            if (position.sellOrBuy === 'Buy' && position.price <= this.trailingStopPrice) {
                return true
            } else if (position.sellOrBuy === 'Sell' && position.price >= this.trailingStopPrice) {
                return true
            }
        }
        return false
    }
}
