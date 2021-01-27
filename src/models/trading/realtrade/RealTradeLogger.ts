import Log from 'models/trading/core/Log'
import AgentLogger from 'models/trading/core/AgentLogger'
import LogRepository from 'infra/db/repository/LogRepository'

export default class RealTradeLogger implements AgentLogger {
    private readonly repository: LogRepository

    constructor() {
        this.repository = new LogRepository()
    }

    async info(message: string): Promise<void> {
        await this.repository.storeLog(new Log(message, 'info'))
    }

    async debug(message: string): Promise<void> {
        await this.repository.storeLog(new Log(message, 'debug'))
    }

    async error(message: string): Promise<void> {
        await this.repository.storeLog(new Log(message, 'error'))
    }
}
