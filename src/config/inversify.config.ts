import { Container } from 'inversify'
import TYPES from 'config/types'
import DirectoryConfig from 'core/DirectoryConfig'
import BacktestAgentLoader from 'models/trading/backtest/BacktestAgentLoader'
import BacktestProcessLauncher from 'models/trading/backtest/BacktestProcessLauncher'
import DefaultAgentCompiler from 'models/trading/common/DefaultAgentCompiler'
import AgentCompiler from 'models/trading/core/AgentCompiler'
import AgentLoader from 'models/trading/core/AgentLoader'
import AgentFileRepository from 'infra/file/AgentFileRepository'
import RealTradeProcessLauncher from 'models/trading/realtrade/RealTradeProcessLauncher'

const container = new Container()
container.bind<DirectoryConfig>(TYPES.DirectoryConfig).toConstantValue(DirectoryConfig.defaultConfig())
container.bind<AgentLoader>(TYPES.AgentLoader).to(BacktestAgentLoader)
container.bind<AgentCompiler>(TYPES.AgentCompiler).to(DefaultAgentCompiler)
container.bind<BacktestProcessLauncher>(TYPES.BacktestProcessLauncher).to(BacktestProcessLauncher).inSingletonScope()
container.bind<AgentFileRepository>(TYPES.AgentFileRepository).to(AgentFileRepository)
container.bind<RealTradeProcessLauncher>(TYPES.RealTradeProcessLauncher).to(RealTradeProcessLauncher).inSingletonScope()

export default container
