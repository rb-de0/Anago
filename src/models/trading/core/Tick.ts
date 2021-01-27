export default class Tick {
    readonly values: TickValue[]
    readonly timestamp: Date

    constructor(values: TickValue[], timestamp: Date) {
        this.values = values
        this.timestamp = timestamp
    }

    get(instrument: string): TickValue | undefined {
        return this.values.find((v) => {
            return v.instrument === instrument
        })
    }
}

export class TickValue {
    readonly instrument: string
    readonly bid: number
    readonly ask: number

    mid(): number {
        return (this.bid + this.ask) / 2.0
    }

    constructor(instrument: string, bid: number, ask: number) {
        this.instrument = instrument
        this.bid = bid
        this.ask = ask
    }
}
