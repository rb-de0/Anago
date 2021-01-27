import mongoose from 'mongoose'
import { GraphDataDocument, GraphDataSchema } from 'infra/db/schema/GraphDataSchema'

export interface GraphDocument {
    type: string
    name: string
    data: GraphDataDocument[]
    maxY: number | null
    minY: number | null
}

export const GraphSchema = new mongoose.Schema({
    data: { type: [GraphDataSchema], require: true },
    name: { type: String, require: true },
    maxY: { type: Number, require: false },
    minY: { type: Number, require: false },
    type: { type: String, enum: ['rate', 'line'], require: true },
})
