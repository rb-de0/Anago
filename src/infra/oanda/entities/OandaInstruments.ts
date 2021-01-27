import OandaInstrument from 'infra/oanda/entities/OandaInstrument'

export default class OandaInstruments {
    instruments: OandaInstrument[]

    constructor(instruments: OandaInstrument[]) {
        this.instruments = instruments
    }
}
