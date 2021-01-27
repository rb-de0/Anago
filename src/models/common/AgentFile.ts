export default class AgentFile {
    readonly name: string

    constructor(name: string) {
        this.name = name
    }

    static isValidFile(name: string): boolean {
        return name.endsWith('ts')
    }
}
