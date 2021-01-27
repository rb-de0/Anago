import mongoose from 'mongoose'

export interface ClosingPolicyDocument {
    takeProfitPrice: number | null
    stopLossPrice: number | null
    trailingStopDistance: number | null
    trailingStopPrice: number | null
}

export const ClosingPolicySchema = new mongoose.Schema({
    takeProfitPrice: { type: Number, require: false },
    stopLossPrice: { type: Number, require: false },
    trailingStopDistance: { type: Number, require: false },
    trailingStopPrice: { type: Number, require: false },
})
