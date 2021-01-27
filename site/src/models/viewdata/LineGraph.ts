import GraphData from 'models/viewdata/GraphData'

export default class LineGraph {
    type = 'line'
    name: string
    data: GraphData[]
    maxY: number
    minY: number

    constructor(name: string, data: GraphData[], maxY: number, minY: number) {
        this.name = name
        this.data = data
        this.maxY = maxY
        this.minY = minY
    }
}
