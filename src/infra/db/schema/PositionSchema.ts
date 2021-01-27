import mongoose from 'mongoose'
import { ClosingPolicyDocument, ClosingPolicySchema } from 'infra/db/schema/ClosingPolicySchema'

export interface PositionDocument {
    _id: mongoose.Types.ObjectId
    instrument: string
    sellOrBuy: string
    entryPrice: number
    entriedAt: Date
    units: number
    price: number | null
    updatedAt: Date | null
    closePrice: number | null
    closedAt: Date | null
    counterRate: number | null
    profitOrLoss: number | null
    status: string
    closingPolicy: ClosingPolicyDocument | null
}

export const PositionSchema = new mongoose.Schema({
    instrument: { type: String, require: true },
    sellOrBuy: { type: String, enum: ['Sell', 'Buy'], require: true },
    entryPrice: { type: Number, require: true },
    entriedAt: { type: Date, require: true },
    units: { type: Number, require: true },
    price: { type: Number, require: false },
    updatedAt: { type: Date, require: false },
    closePrice: { type: Number, require: false },
    closedAt: { type: Date, require: false },
    counterRate: { type: Number, require: false },
    profitOrLoss: { type: Number, require: false },
    status: { type: String, enum: ['Live', 'Closed'], require: true },
    closingPolicy: { type: ClosingPolicySchema, require: false },
})
