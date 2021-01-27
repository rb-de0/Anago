import mongoose from 'mongoose'

export interface GraphDataDocument {
    timestamp: Date
    value: number
}

export const GraphDataSchema = new mongoose.Schema({
    timestamp: { type: Date, require: true },
    value: { type: Number, require: true },
})
