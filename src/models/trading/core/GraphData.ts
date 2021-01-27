import { GraphDataDocument } from 'infra/db/schema/GraphDataSchema'

export default class GraphData implements GraphDataDocument {
    timestamp: Date
    value: number

    constructor(timestamp: Date, value: number) {
        this.timestamp = timestamp
        this.value = value
    }
}
