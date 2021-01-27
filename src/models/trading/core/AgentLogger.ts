export default interface AgentLogger {
    info(message: string): Promise<void>
    debug(message: string): Promise<void>
    error(message: string): Promise<void>
}
