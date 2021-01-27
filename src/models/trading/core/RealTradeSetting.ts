import mongoose from 'mongoose'
import { RealTradeSettingDocument } from 'infra/db/schema/RealTradeSettingSchema'

export default class RealTradeSetting implements RealTradeSettingDocument {
    _id: mongoose.Types.ObjectId
    readonly agent: string
    readonly parameters: any | null

    constructor(agent: string, parameters: any | null) {
        this._id = mongoose.Types.ObjectId()
        this.agent = agent
        this.parameters = parameters
    }
}
