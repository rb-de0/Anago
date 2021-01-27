import mongoose from 'mongoose'
import GraphData from 'models/trading/core/GraphData'
import { GraphDocument } from 'infra/db/schema/GraphSchema'

export default class Graph implements GraphDocument {
    _id: mongoose.Types.ObjectId
    type: GraphType
    name: string
    data: GraphData[]
    maxY: number | null
    minY: number | null

    constructor(type: GraphType, name: string, data: GraphData[], maxY: number | null, minY: number | null) {
        this._id = mongoose.Types.ObjectId()
        this.name = name
        this.type = type
        this.data = data
        this.maxY = maxY
        this.minY = minY
    }
}

export type GraphType = 'rate' | 'line'
