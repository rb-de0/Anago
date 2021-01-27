import mongoose, { Document } from 'mongoose'

export interface UserDocument {
    username: string
    password: string
    apiKey: string
    apiType: string
    lastSelectedInstrument: string | null
}

interface UserMongoDBDocument extends Document, UserDocument {}

export const UserSchema = new mongoose.Schema({
    username: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    apiKey: { type: String, require: true },
    apiType: { type: String, enum: ['Real', 'Practice'], require: true },
    lastSelectedInstrument: { type: String, require: false },
})

export const UserModel = mongoose.model<UserMongoDBDocument>('User', UserSchema)
