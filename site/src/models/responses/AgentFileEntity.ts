export default class AgentFileEntity {
    readonly name: string
    readonly type: string

    constructor(name: string, type: string) {
        this.name = name
        this.type = type
    }
}
