import mongoose from 'mongoose'
import { BacktestDocument } from 'infra/db/schema/BacktestSchema'
import Graph from 'models/trading/core/Graph'
import { Interval } from 'models/trading/core/Interval'
import Log from 'models/trading/core/Log'
import Position from 'models/trading/core/Position'

export default class Backtest implements BacktestDocument {
    _id: mongoose.Types.ObjectId
    readonly name: string
    readonly description: string | null
    readonly start: Date
    readonly end: Date
    readonly proceeded: Date | null = null
    readonly interval: Interval
    readonly balance: number
    readonly agent: string
    readonly status: BacktestStatus
    readonly instruments: string[]
    readonly parameters: any | null
    positions: Position[] = []
    logs: Log[] = []
    graphs: Graph[] = []

    constructor(name: string, description: string | null, start: Date, end: Date, interval: Interval, balance: number, agent: string, instruments: string[], parameters: any | null) {
        this._id = mongoose.Types.ObjectId()
        this.name = name
        this.description = description
        this.start = start
        this.end = end
        this.interval = interval
        this.balance = balance
        this.agent = agent
        this.status = 'Preparing'
        this.instruments = instruments
        this.parameters = parameters
    }
}

export type BacktestStatus = 'Preparing' | 'Running' | 'Finished' | 'FinishWithError'
