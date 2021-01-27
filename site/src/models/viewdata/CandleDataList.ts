import moment from 'moment'
import GraphEntity from 'models/responses/GraphEntity'
import PositionEntity from 'models/responses/PositionEntity'
import CandleChartRange from 'models/viewdata/CandleChartRange'
import CandleData from 'models/viewdata/CandleData'
import CandleOrderAnnotation from 'models/viewdata/CandleOrderAnnotation'
import LineGraph from 'models/viewdata/LineGraph'
import GraphData from 'models/viewdata/GraphData'
import CandleRateGraph from 'models/viewdata/CandleRateGraph'

export default class CandleDataList {
    startDate: Date
    endDate: Date
    maxY: number
    minY: number
    candles: CandleData[]
    annotations: CandleOrderAnnotation[]
    rateGraphs: CandleRateGraph[]
    lineGraphs: LineGraph[]

    constructor(startDate: Date, endDate: Date, range: CandleChartRange, candles: CandleData[], positions: PositionEntity[], graphs: GraphEntity[]) {
        this.startDate = startDate
        this.endDate = endDate
        this.candles = candles
        const annotations: CandleOrderAnnotation[] = []
        for (const position of positions) {
            const entryDate = moment(position.entriedAt)
            if (entryDate.isSameOrAfter(range.start) && entryDate.isSameOrBefore(range.end)) {
                const annotation = new CandleOrderAnnotation(entryDate.toDate(), position.sellOrBuy, true, position.profitOrLoss, position.entryPrice)
                annotations.push(annotation)
            }
            if (position.closedAt == null || position.closePrice == null) {
                continue
            }
            const closeDate = moment(position.closedAt)
            if (closeDate.isSameOrAfter(range.start) && closeDate.isSameOrBefore(range.end)) {
                const annotation = new CandleOrderAnnotation(closeDate.toDate(), position.sellOrBuy, false, position.profitOrLoss, position.closePrice)
                annotations.push(annotation)
            }
        }
        this.annotations = annotations
        const lineGraphs = graphs.filter((g) => {
            return g.type === 'line'
        })
        this.lineGraphs = lineGraphs.map((g) => {
            const data = g.data.map((d) => {
                return new GraphData(d.timestamp, d.value)
            })
            return new LineGraph(g.name, data, g.maxY ?? 100, g.minY ?? 0)
        })
        const rateGraphs = graphs.filter((g) => {
            return g.type === 'rate'
        })
        this.rateGraphs = rateGraphs.map((g) => {
            const data = g.data.map((d) => {
                return new GraphData(d.timestamp, d.value)
            })
            return new CandleRateGraph(g.name, data)
        })
        // 軸範囲補正
        const rateValues: number[] = []
        for (const rateGraph of rateGraphs) {
            const data = rateGraph.data.map((d) => {
                return d
            })
            let inRangeFounded = false
            let afterRangeFounded = false
            for (let i = 0; i < data.length; i++) {
                if (moment(data[i].timestamp).isSameOrAfter(range.start) && moment(data[i].timestamp).isSameOrBefore(range.end)) {
                    if (inRangeFounded === false && i > 0) {
                        rateValues.push(data[i - 1].value)
                    }
                    rateValues.push(data[i].value)
                    inRangeFounded = true
                }
                if (moment(data[i].timestamp).isAfter(range.end) && i > 0 && afterRangeFounded === false) {
                    if (moment(data[i - 1].timestamp).isSameOrAfter(range.start) && moment(data[i - 1].timestamp).isSameOrBefore(range.end)) {
                        rateValues.push(data[i].value)
                    }
                    afterRangeFounded = true
                }
            }
        }
        const highValues = candles
            .map((c) => {
                return c.y[1]
            })
            .concat(rateValues)
        const minValues = candles
            .map((c) => {
                return c.y[2]
            })
            .concat(rateValues)
        let max: number
        if (highValues.length > 0) {
            max = highValues.reduce((a, b) => {
                return Math.max(a, b)
            })
        } else {
            max = 0
        }
        let min: number
        if (minValues.length > 0) {
            min = minValues.reduce((a, b) => {
                return Math.min(a, b)
            })
        } else {
            min = 0
        }
        const diff = (max - min) * 0.1
        this.maxY = max + diff
        this.minY = min - diff
    }
}
