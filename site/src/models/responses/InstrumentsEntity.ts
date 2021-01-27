import InstrumentEntity from 'models/responses/InstrumentEntity'

export default class InstrumentsEntity {
    readonly instruments: InstrumentEntity[]

    constructor(instruments: InstrumentEntity[]) {
        this.instruments = instruments
    }
}
