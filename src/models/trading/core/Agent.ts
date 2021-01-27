import Broker from 'models/trading/core/Broker'
import Tick from 'models/trading/core/Tick'
import AgentLogger from 'models/trading/core/AgentLogger'
import GraphPainter from 'models/trading/core/GraphPainter'

export default abstract class Agent {
    protected broker!: Broker
    protected logger!: AgentLogger
    protected parameters!: any
    protected graphPainter: GraphPainter | null = null
    abstract name: string
    abstract description: string

    attachGraphPainter(painter: GraphPainter) {
        this.graphPainter = painter
    }

    attachLogger(logger: AgentLogger) {
        this.logger = logger
    }

    attach(broker: Broker) {
        this.broker = broker
    }

    attachParameters(parameters: any) {
        this.parameters = parameters
    }

    printEnviroment() {
        this.logger.debug(`name: ${this.name}`)
        this.logger.debug(`description: ${this.description}`)
        this.logger.debug(`parameters: ${JSON.stringify(this.parameters)}`)
    }

    abstract async setup(): Promise<void>
    abstract async nextTick(tick: Tick): Promise<void>
}
