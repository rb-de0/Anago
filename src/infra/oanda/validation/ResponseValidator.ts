import Joi from '@hapi/joi'

export default class OandaAccountValidator {
    static validateAccount(response: any): string | null {
        const accountSchema = Joi.object({
            id: Joi.string().min(1).required(),
        })
        const accountsSchema = Joi.object({
            accounts: Joi.array().items(accountSchema).min(1).required(),
        })
        const result = accountsSchema.validate(response, {
            allowUnknown: true,
        })
        return result.error == null ? null : result.error.message
    }

    static validateAccountSummary(response: any): string | null {
        const accountSummarySchema = Joi.object({
            id: Joi.string().min(1).required(),
            currency: Joi.string().min(1).required(),
            balance: Joi.number().required(),
        })
        const accountSchema = Joi.object({
            account: accountSummarySchema.required(),
        })
        const result = accountSchema.validate(response, {
            allowUnknown: true,
        })
        return result.error == null ? null : result.error.message
    }

    static validateInstruments(response: any): string | null {
        const instrumentSchema = Joi.object({
            name: Joi.string().min(1).required(),
            pipLocation: Joi.number().required(),
        })
        const instrumentsSchema = Joi.object({
            instruments: Joi.array().items(instrumentSchema).required(),
        })
        const result = instrumentsSchema.validate(response, {
            allowUnknown: true,
        })
        return result.error == null ? null : result.error.message
    }

    static validateCandles(response: any): string | null {
        const candleStickDataSchema = Joi.object({
            h: Joi.string().min(1).required(),
            l: Joi.string().min(1).required(),
            o: Joi.string().min(1).required(),
            c: Joi.string().min(1).required(),
        })
        const candleStickSchema = Joi.object({
            bid: candleStickDataSchema.required(),
            ask: candleStickDataSchema.required(),
            time: Joi.date().required(),
            volume: Joi.number().required(),
        })
        const candlesSchema = Joi.object({
            instrument: Joi.string().min(1).required(),
            granularity: Joi.string().min(1).required(),
            candles: Joi.array().items(candleStickSchema).required(),
        })
        const result = candlesSchema.validate(response, {
            allowUnknown: true,
        })
        return result.error == null ? null : result.error.message
    }

    static validateTicks(response: any): string | null {
        const priceValueSchema = Joi.object({
            price: Joi.number().required(),
        })
        const priceSchema = Joi.object({
            bids: Joi.array().items(priceValueSchema).required(),
            asks: Joi.array().items(priceValueSchema).required(),
            tradeable: Joi.bool().required(),
        })
        const priceListSchema = Joi.object({
            prices: Joi.array().items(priceSchema).required(),
        })
        const result = priceListSchema.validate(response, {
            allowUnknown: true,
        })
        return result.error == null ? null : result.error.message
    }

    static validateTrade(response: any): string | null {
        const takeProfitSchema = Joi.object({
            price: Joi.number().required(),
        })
        const stopLossSchema = Joi.object({
            price: Joi.number().required(),
        })
        const trailingStopLossSchema = Joi.object({
            distance: Joi.number().required(),
        })
        const tradeSchema = Joi.object({
            id: Joi.string().min(1).required(),
            instrument: Joi.string().min(1).required(),
            price: Joi.number().required(),
            openTime: Joi.date().required(),
            initialUnits: Joi.number().required(),
            currentUnits: Joi.number().required(),
            state: Joi.string().min(1).required(),
            realizedPL: Joi.number().required(),
            unrealizedPL: Joi.number(),
            averageClosePrice: Joi.number(),
            closeTime: Joi.date(),
            takeProfitOrder: takeProfitSchema,
            stopLossOrder: stopLossSchema,
            trailingStopLossOrder: trailingStopLossSchema,
        })
        const schema = Joi.object({
            trade: tradeSchema,
        })
        const result = schema.validate(response, {
            allowUnknown: true,
        })
        return result.error == null ? null : result.error.message
    }

    static validateTrades(response: any): string | null {
        const takeProfitSchema = Joi.object({
            price: Joi.number().required(),
        })
        const stopLossSchema = Joi.object({
            price: Joi.number().required(),
        })
        const trailingStopLossSchema = Joi.object({
            distance: Joi.number().required(),
        })
        const tradeSchema = Joi.object({
            id: Joi.string().min(1).required(),
            instrument: Joi.string().min(1).required(),
            price: Joi.number().required(),
            openTime: Joi.date().required(),
            initialUnits: Joi.number().required(),
            currentUnits: Joi.number().required(),
            state: Joi.string().min(1).required(),
            realizedPL: Joi.number().required(),
            unrealizedPL: Joi.number(),
            averageClosePrice: Joi.number(),
            closeTime: Joi.date(),
            takeProfitOrder: takeProfitSchema,
            stopLossOrder: stopLossSchema,
            trailingStopLossOrder: trailingStopLossSchema,
        })
        const tradesSchema = Joi.object({
            trades: Joi.array().items(tradeSchema).required(),
        })
        const result = tradesSchema.validate(response, {
            allowUnknown: true,
        })
        return result.error == null ? null : result.error.message
    }

    static validateOrders(response: any): string | null {
        const takeProfitSchema = Joi.object({
            price: Joi.number().required(),
        })
        const stopLossSchema = Joi.object({
            price: Joi.number().required(),
        })
        const trailingStopLossSchema = Joi.object({
            distance: Joi.number().required(),
        })
        const orderSchema = Joi.object({
            id: Joi.string().min(1).required(),
            createTime: Joi.date().required(),
            state: Joi.string().min(1).required(),
            type: Joi.string().min(1).required(),
            instrument: Joi.string(),
            units: Joi.number(),
            price: Joi.number(),
            timeInForce: Joi.string(),
            gtdTime: Joi.string(),
            takeProfitOnFill: takeProfitSchema,
            stopLossOnFill: stopLossSchema,
            trailingStopLossOnFill: trailingStopLossSchema,
        })
        const ordersSchema = Joi.object({
            orders: Joi.array().items(orderSchema).required(),
        })
        const result = ordersSchema.validate(response, {
            allowUnknown: true,
        })
        return result.error == null ? null : result.error.message
    }

    static validateOrderResult(response: any): string | null {
        const takeProfitSchema = Joi.object({
            price: Joi.number().required(),
        })
        const stopLossSchema = Joi.object({
            distance: Joi.number().required(),
        })
        const trailingStopLossSchema = Joi.object({
            distance: Joi.number().required(),
        })
        const openedTradeSchema = Joi.object({
            tradeID: Joi.string().min(1).required(),
        })
        const tradeSchema = Joi.object({
            tradeID: Joi.string().min(1).required(),
            price: Joi.number().required(),
            units: Joi.number().required(),
        })
        const fillTransactionSchema = Joi.object({
            time: Joi.date().required(),
            tradeOpened: openedTradeSchema,
            tradeReduced: tradeSchema,
            tradeClosed: Joi.array().items(tradeSchema),
        })
        const createTransactionSchema = Joi.object({
            id: Joi.string().min(1).required(),
            instrument: Joi.string().required(),
            type: Joi.string().min(1).required(),
            units: Joi.number().required(),
            time: Joi.date().required(),
            price: Joi.number(),
            timeInForce: Joi.string(),
            gtdTime: Joi.string(),
            takeProfitOnFill: takeProfitSchema,
            stopLossOnFill: stopLossSchema,
            trailingStopLossOnFill: trailingStopLossSchema,
        })
        const resultSchema = Joi.object({
            orderCreateTransaction: createTransactionSchema,
            orderFillTransaction: fillTransactionSchema,
        })
        const result = resultSchema.validate(response, {
            allowUnknown: true,
        })
        return result.error == null ? null : result.error.message
    }
}
