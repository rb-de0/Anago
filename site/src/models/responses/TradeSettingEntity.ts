export default class TradeSettingEntity {
    readonly _id: string
    readonly agent: string
    readonly parameters: any | null

    constructor(_id: string, agent: string, parameters: any | null) {
        this._id = _id
        this.agent = agent
        this.parameters = parameters
    }

    get parametersRepresentation(): string {
        return Object.keys(this.parameters)
            .map((key) => {
                return `${key}: ${this.parameters[key]}`
            })
            .join('<br>')
    }
}
