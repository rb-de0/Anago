import { Type } from 'class-transformer'

export default class GraphDataEntity {
    @Type(() => Date)
    timestamp: Date
    value: number

    constructor(timestamp: Date, value: number) {
        this.timestamp = timestamp
        this.value = value
    }
}
