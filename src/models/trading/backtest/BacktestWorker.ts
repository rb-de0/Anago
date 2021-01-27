import container from 'config/inversify.config'
import TYPES from 'config/types'
import DirectoryConfig from 'core/DirectoryConfig'
import BacktestRepository from 'infra/db/repository/BacktestRepository'
import { BacktestGraphRepository } from 'infra/db/repository/GraphRepository'
import BacktestBroker from 'models/trading/backtest/BacktestBroker'
import BacktestLogger from 'models/trading/backtest/BacktestLogger'
import BacktestService from 'models/trading/backtest/BacktestService'
import Agent from 'models/trading/core/Agent'
import AgentLoader from 'models/trading/core/AgentLoader'
import Backtest from 'models/trading/core/Backtest'
import Broker from 'models/trading/core/Broker'
import Pair from 'models/trading/core/Pair'

export default class BacktestWorker {
    private backtestId: string
    private backtest: Backtest
    private agent: Agent | null = null
    private broker: Broker
    private service: BacktestService
    private repository: BacktestRepository

    constructor(backtest: Backtest, backtestId: string, pairs: Pair[]) {
        this.backtest = backtest
        this.backtestId = backtestId
        this.repository = new BacktestRepository()
        this.service = new BacktestService(backtest, backtestId, pairs)
        this.broker = new BacktestBroker(this.service)
    }

    async prepareAgent() {
        const config = container.get<DirectoryConfig>(TYPES.DirectoryConfig)
        const agentFilePath = `${config.agent.root}/${this.backtest.agent}`
        const loader = container.get<AgentLoader>(TYPES.AgentLoader)
        this.agent = await loader.load(agentFilePath)
        this.agent.attach(this.broker)
        this.agent.attachLogger(new BacktestLogger(this.backtestId))
        this.agent.attachParameters(this.backtest.parameters)
        this.agent.attachGraphPainter(new BacktestGraphRepository(this.backtestId))
        this.agent.printEnviroment()
        await this.agent.setup()
    }

    // バックテストを開始する
    async start() {
        await this.repository.updateStatus(this.backtestId, 'Running')
        while (true) {
            // ティックを一つ進める
            await this.service.advanceTick()
            // ティックを取得する
            const tick = await this.service.getCurrentTick()
            if (tick != null) {
                await this.agent?.nextTick(tick)
                await this.repository.updateProgress(this.backtestId, tick.timestamp)
            }
            // 次に取得するティックが存在しない場合は終了する
            const hasNext = await this.service.hasNext()
            if (!hasNext) {
                break
            }
        }
        await this.repository.updateProgress(this.backtestId, this.backtest.end)
    }
}
