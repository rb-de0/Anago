import PathUtil from 'utils/PathUtil'

export class ProjectDirectoryConfig {
    readonly projectRoot: string
    readonly publicRoot: string
    readonly baseUrl: string

    constructor(projectRoot: string, publicRoot: string, baseUrl: string) {
        this.projectRoot = projectRoot
        this.publicRoot = publicRoot
        this.baseUrl = baseUrl
    }
}

export class AgentDirectoryConfig {
    readonly root: string
    readonly modelPath: string

    constructor(root: string, modelPath: string) {
        this.root = root
        this.modelPath = modelPath
    }
}

export class SubprocessConfig {
    readonly backtest: string
    readonly realtrade: string

    constructor(backtest: string, realtrade: string) {
        this.backtest = backtest
        this.realtrade = realtrade
    }
}

export default class DirectoryConfig {
    readonly project: ProjectDirectoryConfig
    readonly agent: AgentDirectoryConfig
    readonly subprocess: SubprocessConfig

    constructor(project: ProjectDirectoryConfig, agent: AgentDirectoryConfig, subprocess: SubprocessConfig) {
        this.project = project
        this.agent = agent
        this.subprocess = subprocess
    }

    static defaultConfig(): DirectoryConfig {
        // base
        const projectRoot = PathUtil.getProjectRoot()
        const publicRoot = `${projectRoot}/site`
        const baseUrl = `${projectRoot}/src`
        const projectConfig = new ProjectDirectoryConfig(projectRoot, publicRoot, baseUrl)
        // agent
        const agentRoot = `${projectRoot}/data/agents`
        const modelPath = `${baseUrl}/core/Model.ts`
        const agentConfig = new AgentDirectoryConfig(agentRoot, modelPath)
        // process
        const subprocessConfig = new SubprocessConfig(`${baseUrl}/models/trading/backtest/BacktestWorkerProcess.ts`, `${baseUrl}/models/trading/realtrade/RealTradeProcess.ts`)
        return new DirectoryConfig(projectConfig, agentConfig, subprocessConfig)
    }
}
