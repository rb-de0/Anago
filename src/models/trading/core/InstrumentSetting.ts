import { InstrumentSettingDocument } from 'infra/db/schema/InstrumentSettingSchema'

export default class InstrumentSetting implements InstrumentSettingDocument {
    name: string

    constructor(name: string) {
        this.name = name
    }
}
