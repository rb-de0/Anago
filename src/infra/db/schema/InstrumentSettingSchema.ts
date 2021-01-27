import mongoose, { Document } from 'mongoose'

export interface InstrumentSettingDocument {
    name: string
}

interface InstrumentSettingMongoDBDocument extends Document, InstrumentSettingDocument {}

export const InstrumentSettingSchema = new mongoose.Schema({
    name: { type: String, require: true },
})

export const InstrumentSettingModel = mongoose.model<InstrumentSettingMongoDBDocument>('InstrumentSetting', InstrumentSettingSchema)
