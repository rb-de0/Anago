import moment from 'moment'
import { Type } from 'class-transformer'
import PositionEntity from 'models/responses/PositionEntity'
import IntervalUtil from 'models/utils/IntervalUtil'
import LogEntity from 'models/responses/LogEntity'
import GraphEntity from 'models/responses/GraphEntity'

export default class BacktestEntity {
    readonly _id: string
    readonly name: string
    readonly description: string | null
    @Type(() => Date)
    readonly start: Date
    @Type(() => Date)
    readonly end: Date
    @Type(() => Date)
    readonly proceeded: Date | null
    readonly interval: string
    readonly balance: number
    readonly agent: string
    readonly status: string
    readonly instruments: string[]
    @Type(() => PositionEntity)
    readonly positions: PositionEntity[]
    @Type(() => LogEntity)
    readonly logs: LogEntity[]
    @Type(() => GraphEntity)
    readonly graphs: GraphEntity[]
    readonly parameters: any | null

    constructor(
        _id: string,
        name: string,
        description: string | null,
        start: Date,
        end: Date,
        proceeded: Date | null,
        interval: string,
        balance: number,
        agent: string,
        status: string,
        instruments: string[],
        positions: PositionEntity[],
        logs: LogEntity[],
        graphs: GraphEntity[],
        parameters: any | null
    ) {
        this._id = _id
        this.name = name
        this.description = description
        this.start = start
        this.end = end
        this.proceeded = proceeded
        this.interval = interval
        this.balance = balance
        this.agent = agent
        this.status = status
        this.instruments = instruments
        this.positions = positions
        this.logs = logs
        this.graphs = graphs
        this.parameters = parameters
    }

    get id(): string {
        return this._id
    }

    get statusText(): string {
        switch (this.status) {
            case 'Preparing':
                return '待機中'
            case 'Running':
                return '実行中'
            case 'Finished':
                return '完了'
            case 'FinishWithError':
                return 'エラー'
        }
        return '不明'
    }

    get intervalText(): string | null {
        return new IntervalUtil().convertToDisplayValue(this.interval)
    }

    get instrumentsText(): string {
        return this.instruments.join('.')
    }

    get periodText(): string {
        return moment(this.start).format('YYYY-MM-D') + ' 〜 ' + moment(this.end).format('YYYY-MM-D')
    }

    get progress(): number {
        if (this.proceeded == null) {
            return 0
        }
        return (moment(this.start).diff(this.proceeded) / moment(this.start).diff(this.end)) * 100
    }

    get parametersRepresentation(): string {
        return Object.keys(this.parameters)
            .map((key) => {
                return `${key}: ${this.parameters[key]}`
            })
            .join('<br>')
    }
}
