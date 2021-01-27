import BacktestRepository from 'infra/db/repository/BacktestRepository'
import Log from 'models/trading/core/Log'
import AgentLogger from 'models/trading/core/AgentLogger'

export default class BacktestLogger implements AgentLogger {
    private readonly id: string
    private readonly repository: BacktestRepository

    constructor(id: string) {
        this.id = id
        this.repository = new BacktestRepository()
    }

    async info(message: string): Promise<void> {
        await this.repository.pushLog(this.id, new Log(message, 'info'))
    }

    async debug(message: string): Promise<void> {
        await this.repository.pushLog(this.id, new Log(message, 'debug'))
    }

    async error(message: string): Promise<void> {
        await this.repository.pushLog(this.id, new Log(message, 'error'))
    }
}
