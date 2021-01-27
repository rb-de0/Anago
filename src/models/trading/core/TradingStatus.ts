import mongoose from 'mongoose'
import { TradingStatusDocument } from 'infra/db/schema/TradingStatusSchema'

export default class TradingStatus implements TradingStatusDocument {
    _id: mongoose.Types.ObjectId
    lastFetched: Date

    constructor(lastFetched: Date) {
        this._id = mongoose.Types.ObjectId()
        this.lastFetched = lastFetched
    }
}
