import Order from 'models/trading/core/Order'

export default class OrderValidator {
    validate(order: Order): boolean {
        switch (order.type) {
            case 'market':
                return this.validateMarket(order)
            case 'limit':
                return this.validateLimit(order)
            case 'stop':
                return this.validateStop(order)
            case 'marketIfTouched':
                return this.validateMarketIfTouched(order)
        }
    }

    private validateMarket(order: Order): boolean {
        return this.validateTakeProfit(order) && this.validateStopLoss(order)
    }

    private validateLimit(order: Order): boolean {
        return this.validatePrice(order) && this.validateTakeProfit(order) && this.validateStopLoss(order)
    }

    private validateStop(order: Order): boolean {
        return this.validatePrice(order) && this.validateTakeProfit(order) && this.validateStopLoss(order)
    }

    private validateMarketIfTouched(order: Order): boolean {
        return this.validatePrice(order) && this.validateTakeProfit(order) && this.validateStopLoss(order)
    }

    private validateTakeProfit(order: Order): boolean {
        const takeProfit = order.takeProfitOnFill
        if (takeProfit == null) {
            return true
        }
        if (order.price == null) {
            return true
        }
        switch (order.sellOrBuy) {
            case 'Buy':
                return order.price < takeProfit.price
            case 'Sell':
                return order.price > takeProfit.price
        }
    }

    private validateStopLoss(order: Order): boolean {
        const stopLoss = order.stopLossOnFill
        if (stopLoss == null) {
            return true
        }
        if (order.price == null) {
            return true
        }
        switch (order.sellOrBuy) {
            case 'Buy':
                return order.price > stopLoss.price
            case 'Sell':
                return order.price < stopLoss.price
        }
    }

    private validatePrice(order: Order): boolean {
        return order.price != null && order.price > 0
    }
}
