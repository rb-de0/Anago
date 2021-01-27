import mongoose, { Document } from 'mongoose'

export interface TradingStatusDocument {
    lastFetched: Date
}

interface TradingStatusMongoDBDocument extends Document, TradingStatusDocument {}

export const TradingStatusSchema = new mongoose.Schema({
    lastFetched: { type: Date },
})

export const TradingStatusModel = mongoose.model<TradingStatusMongoDBDocument>('TradingStatus', TradingStatusSchema)
