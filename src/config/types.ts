const TYPES = {
    DirectoryConfig: Symbol.for('DirectoryConfig'),
    AgentLoader: Symbol.for('AgentLoader'),
    AgentCompiler: Symbol.for('AgentCompiler'),
    BacktestProcessLauncher: Symbol.for('BacktestProcessLauncher'),
    CounterPairResolver: Symbol.for('CounterPairResolver'),
    OandaAccountService: Symbol.for('OandaAccountService'),
    AgentFileRepository: Symbol.for('AgentFileRepository'),
    RealTradeProcessLauncher: Symbol.for('RealTradeProcessLauncher'),
}

export default TYPES
