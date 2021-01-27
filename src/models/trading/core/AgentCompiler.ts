export default interface AgentCompiler {
    compile(agentFilePath: string): Promise<string>
}
