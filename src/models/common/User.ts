import mongoose from 'mongoose'
import { UserDocument } from 'infra/db/schema/UserSchema'

export default class User implements UserDocument {
    readonly _id: mongoose.Types.ObjectId
    readonly username: string
    readonly password: string
    readonly apiKey: string
    readonly apiType: OandaAPIType
    readonly lastSelectedInstrument: string | null

    constructor(username: string, password: string, apiKey: string, apiType: OandaAPIType, lastSelectedInstrument: string | null) {
        this._id = mongoose.Types.ObjectId()
        this.username = username
        this.password = password
        this.apiKey = apiKey
        this.apiType = apiType
        this.lastSelectedInstrument = lastSelectedInstrument
    }
}

export type OandaAPIType = 'Real' | 'Practice'
