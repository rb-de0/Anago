import mongoose, { Document } from 'mongoose'
import { PositionDocument, PositionSchema } from 'infra/db/schema/PositionSchema'
import { LogDocument, LogSchema } from 'infra/db/schema/LogSchema'
import { GraphDocument, GraphSchema } from 'infra/db/schema/GraphSchema'

export interface BacktestDocument {
    name: string
    description: string | null
    start: Date
    end: Date
    proceeded: Date | null
    interval: string
    balance: number
    agent: string
    status: string
    instruments: string[]
    positions: PositionDocument[]
    logs: LogDocument[]
    graphs: GraphDocument[]
    parameters: any | null
}

interface BacktestMongoDBDocument extends Document, BacktestDocument {}

export const BacktestSchema = new mongoose.Schema({
    name: { type: String, require: true },
    description: { type: String, require: false },
    start: { type: Date, require: true },
    end: { type: Date, require: true },
    proceeded: { type: Date, require: false },
    interval: { type: String, enum: ['S15', 'M1', 'M15', 'M30', 'H1', 'H6', 'D'], require: true },
    balance: { type: Number, require: true },
    agent: { type: String, require: true },
    status: { type: String, enum: ['Preparing', 'Running', 'Finished', 'FinishWithError'], require: true },
    instruments: { type: [String], require: true },
    positions: { type: [PositionSchema], require: false },
    logs: { type: [LogSchema], require: false },
    graphs: { type: [GraphSchema], require: false },
    parameters: {},
})

export const BacktestModel = mongoose.model<BacktestMongoDBDocument>('Backtest', BacktestSchema)
