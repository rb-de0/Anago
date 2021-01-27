import mongoose, { Document } from 'mongoose'

export interface RealTradeSettingDocument {
    agent: string
    parameters: any | null
}

interface RealTradeSettingMongoDBDocument extends Document, RealTradeSettingDocument {}

export const RealTradeSettingSchema = new mongoose.Schema({
    agent: { type: String, require: true },
    parameters: {},
})

export const RealTradeSettingModel = mongoose.model<RealTradeSettingMongoDBDocument>('TradeSetting', RealTradeSettingSchema)
