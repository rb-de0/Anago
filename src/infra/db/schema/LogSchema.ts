import mongoose, { Document } from 'mongoose'

export interface LogDocument {
    timestamp: Date
    message: string
    level: string
}

interface LogMongoDBDocument extends Document, LogDocument {}

export const LogSchema = new mongoose.Schema({
    timestamp: { type: Date, require: true },
    message: { type: String, require: true },
    level: { type: String, enum: ['info', 'debug', 'error'], require: true },
})

export const LogModel = mongoose.model<LogMongoDBDocument>('Log', LogSchema)
