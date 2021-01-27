import GraphDataEntity from 'models/responses/GraphDataEntity'

export default class GraphEntity {
    type: string
    name: string
    data: GraphDataEntity[]
    maxY: number | null
    minY: number | null

    constructor(type: string, name: string, data: GraphDataEntity[], maxY: number | null, minY: number | null) {
        this.name = name
        this.type = type
        this.data = data
        this.maxY = maxY
        this.minY = minY
    }
}
