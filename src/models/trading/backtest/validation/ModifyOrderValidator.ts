import Order, { ModifyOrder } from 'models/trading/core/Order'

export default class ModifyOrderValidator {
    validate(order: Order, modifyOrder: ModifyOrder): boolean {
        switch (order.type) {
            case 'market':
                return this.validateMarket(order, modifyOrder)
            case 'limit':
                return this.validateLimit(order, modifyOrder)
            case 'stop':
                return this.validateStop(order, modifyOrder)
            case 'marketIfTouched':
                return this.validateMarketIfTouched(order, modifyOrder)
        }
    }

    private validateMarket(order: Order, modifyOrder: ModifyOrder): boolean {
        return this.validateTakeProfit(order, modifyOrder) && this.validateStopLoss(order, modifyOrder)
    }

    private validateLimit(order: Order, modifyOrder: ModifyOrder): boolean {
        return this.validatePrice(order, modifyOrder) && this.validateTakeProfit(order, modifyOrder) && this.validateStopLoss(order, modifyOrder)
    }

    private validateStop(order: Order, modifyOrder: ModifyOrder): boolean {
        return this.validatePrice(order, modifyOrder) && this.validateTakeProfit(order, modifyOrder) && this.validateStopLoss(order, modifyOrder)
    }

    private validateMarketIfTouched(order: Order, modifyOrder: ModifyOrder): boolean {
        return this.validatePrice(order, modifyOrder) && this.validateTakeProfit(order, modifyOrder) && this.validateStopLoss(order, modifyOrder)
    }

    private validateTakeProfit(order: Order, modifyOrder: ModifyOrder): boolean {
        const takeProfit = order.takeProfitOnFill ?? modifyOrder.takeProfitOnFill
        if (takeProfit == null) {
            return true
        }
        const price = modifyOrder.price ?? order.price
        if (price == null) {
            return true
        }
        switch (order.sellOrBuy) {
            case 'Buy':
                return price < takeProfit.price
            case 'Sell':
                return price > takeProfit.price
        }
    }

    private validateStopLoss(order: Order, modifyOrder: ModifyOrder): boolean {
        const stopLoss = order.stopLossOnFill ?? modifyOrder.stopLossOnFill
        if (stopLoss == null) {
            return true
        }
        const price = modifyOrder.price ?? order.price
        if (price == null) {
            return true
        }
        switch (order.sellOrBuy) {
            case 'Buy':
                return price > stopLoss.price
            case 'Sell':
                return price < stopLoss.price
        }
    }

    private validatePrice(order: Order, modifyOrder: ModifyOrder): boolean {
        const price = modifyOrder.price ?? order.price
        return price != null && price > 0
    }
}
