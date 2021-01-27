import { inject, injectable } from 'inversify'
import TYPES from 'config/types'
import Agent from 'models/trading/core/Agent'
import AgentCompiler from 'models/trading/core/AgentCompiler'
import AgentLoader from 'models/trading/core/AgentLoader'

@injectable()
export default class BacktestAgentLoader implements AgentLoader {
    private readonly compiler: AgentCompiler

    constructor(@inject(TYPES.AgentCompiler) compiler: AgentCompiler) {
        this.compiler = compiler
    }

    async load(agentFilePath: string): Promise<Agent> {
        const output = await this.compiler.compile(agentFilePath)
        const evaluated = eval(output)
        const agent = new evaluated() as Agent
        return agent
    }
}
