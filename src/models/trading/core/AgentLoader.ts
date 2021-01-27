import Agent from 'models/trading/core/Agent'

export default interface AgentLoader {
    load(agentFilePath: string): Promise<Agent>
}
