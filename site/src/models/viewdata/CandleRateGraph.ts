import GraphData from 'models/viewdata/GraphData'

export default class CandleRateGraph {
    type = 'line'
    name: string
    data: GraphData[]

    constructor(name: string, data: GraphData[]) {
        this.name = name
        this.data = data
    }
}
