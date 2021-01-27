import moment from 'moment'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import DirectoryConfig from 'core/DirectoryConfig'
import { RealTradeGraphRepository } from 'infra/db/repository/GraphRepository'
import LogRepository from 'infra/db/repository/LogRepository'
import RealTradeRepository from 'infra/db/repository/RealTradeRepository'
import TradingStatusRepository from 'infra/db/repository/TradingStatusRepository'
import OandaTickRepository from 'infra/oanda/OandaTickRepository'
import Agent from 'models/trading/core/Agent'
import AgentLoader from 'models/trading/core/AgentLoader'
import Broker from 'models/trading/core/Broker'
import Log from 'models/trading/core/Log'
import RealTradeSetting from 'models/trading/core/RealTradeSetting'
import Tick, { TickValue } from 'models/trading/core/Tick'
import TradingStatus from 'models/trading/core/TradingStatus'
import RealTradeBroker from 'models/trading/realtrade/RealTradeBroker'
import RealTradeLogger from 'models/trading/realtrade/RealTradeLogger'
import ThreadUtil from 'utils/ThreadUtil'
import InstrumentSettingRepository from 'infra/db/repository/InstrumentSettingRepository'

export default class RealTradeWorker {
    private readonly repository: OandaTickRepository
    private readonly statusRepository: TradingStatusRepository
    private readonly logRepository: LogRepository
    private interval: number = 15

    constructor() {
        this.repository = new OandaTickRepository()
        this.statusRepository = new TradingStatusRepository()
        this.logRepository = new LogRepository()
    }

    async start() {
        const tradeSettings = await new RealTradeRepository().loadRealTradeSettings()
        if (tradeSettings.length === 0) {
            return
        }
        const broker = new RealTradeBroker()
        const agents = await this.createAgents(tradeSettings, broker)
        await this.runLoop(agents)
    }

    private async createAgents(settings: RealTradeSetting[], broker: Broker): Promise<Agent[]> {
        const agents: Agent[] = []
        const config = container.get<DirectoryConfig>(TYPES.DirectoryConfig)
        const loader = container.get<AgentLoader>(TYPES.AgentLoader)
        for (const setting of settings) {
            const agentFilePath = `${config.agent.root}/${setting.agent}`
            const agent = await loader.load(agentFilePath)
            agent.attach(broker)
            agent.attachLogger(new RealTradeLogger())
            agent.attachParameters(setting.parameters)
            agent.attachGraphPainter(new RealTradeGraphRepository())
            agent.printEnviroment()
            await agent.setup()
            agents.push(agent)
        }
        return agents
    }

    private async runLoop(agents: Agent[]) {
        const instruments = await new InstrumentSettingRepository().loadSettings()
        const names = instruments.map((i) => {
            return i.name
        })
        if (instruments.length === 0) {
            await this.logRepository.storeLog(new Log('取得する通貨ペアが設定されていません', 'error'))
            throw new Error('取得する通貨ペアが設定されていません')
        }
        while (true) {
            try {
                const tickWithStatus = await this.fetchTick(names)
                const currentTick = tickWithStatus.tick
                const status = await this.statusRepository.loadTradingStatus()
                if (status != null) {
                    if (moment(currentTick.timestamp).diff(moment(status.lastFetched), 'seconds') < 10) {
                        throw new Error('不正なプロセスを検知しました')
                    }
                }
                await this.statusRepository.replaceTradingStatus(new TradingStatus(currentTick.timestamp))
                if (tickWithStatus.tradeable === true) {
                    this.interval = 15
                    for (const agent of agents) {
                        await agent.nextTick(currentTick)
                    }
                } else {
                    this.interval = 60 * 60
                }
            } catch (error) {
                await this.logRepository.storeLog(new Log(error.toString(), 'error'))
                if (error.toString().includes('不正なプロセスを検知しました') === true) {
                    throw error
                }
            }
            ThreadUtil.sleep(this.interval)
        }
    }

    private async fetchTick(instruments: string[]): Promise<TickWithStatus> {
        const oandaTick = await this.repository.fetchLatestTick(instruments)
        const tickValues: TickValue[] = []
        for (const price of oandaTick.prices) {
            if (price.bids.length < 1 || price.asks.length < 1) {
                continue
            }
            const bid = Math.max.apply(
                null,
                price.bids.map((p) => {
                    return p.price
                })
            )
            const ask = Math.max.apply(
                null,
                price.asks.map((p) => {
                    return p.price
                })
            )
            tickValues.push(new TickValue(price.instrument, bid, ask))
        }
        const isClosed =
            oandaTick.prices.find((p) => {
                p.tradeable === false
            }) != null
        const tick = new Tick(tickValues, new Date())
        return new TickWithStatus(tick, isClosed === false)
    }
}

class TickWithStatus {
    tick: Tick
    tradeable: boolean

    constructor(tick: Tick, tradeable: boolean) {
        this.tick = tick
        this.tradeable = tradeable
    }
}
