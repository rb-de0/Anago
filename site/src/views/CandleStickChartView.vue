<template>
    <div v-if="candleData.candles.length > 0">
        <apexchart ref="apexChart" height="500" type="line" :options="chartOptions" :series="series"></apexchart>
        <template v-for="(chart, index) in lineCharts">
            <apexchart :key="chart.name" height="200" type="line" :options="lineOptions[index]" :series="lineSeries[index]"></apexchart>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import VueApexCharts from 'vue-apexcharts'
import moment from 'moment'
import CandleDataList from 'models/viewdata/CandleDataList'
import CandleChartRange from 'models/viewdata/CandleChartRange'

@Component({
    components: {
        apexchart: VueApexCharts,
    },
})
export default class CandleStickChartView extends Vue {
    @Prop(CandleDataList) readonly candleData!: CandleDataList
    @Prop(CandleChartRange) readonly range!: CandleChartRange

    lineOptions: any = null
    lineSeries: any = null

    @Watch('candleData', { immediate: true })
    onCandleDataChanged() {
        this.createLineOptions()
        this.createLineSeries()
    }

    @Watch('range', { immediate: true })
    onRangeChanged() {
        this.createLineOptions()
        this.createLineSeries()
    }

    private createLineOptions() {
        if (this.candleData == null || this.range == null) {
            return
        }
        this.lineOptions = this.candleData.lineGraphs.map((g) => {
            return {
                chart: {
                    id: g.name,
                    toolbar: {
                        autoSelected: 'pan',
                        show: false,
                        tools: {
                            pan: false,
                        },
                    },
                    zoom: {
                        enabled: true,
                    },
                    animations: {
                        enabled: false,
                    },
                },
                title: {
                    text: g.name,
                    align: 'left',
                },
                xaxis: {
                    type: 'datetime',
                    min: this.range.start,
                    max: this.range.end,
                    labels: {
                        show: false,
                    },
                },
                yaxis: {
                    min: g.minY,
                    max: g.maxY,
                    labels: {
                        show: true,
                        formatter: (value: any) => {
                            return Math.floor(value * 1000) / 1000
                        },
                    },
                },
                legend: {
                    show: false,
                },
                tooltip: {
                    enabled: false,
                },
                stroke: {
                    width: 1,
                    colors: ['#043c78'],
                },
            }
        })
    }

    private createLineSeries() {
        if (this.candleData == null || this.range == null) {
            return
        }
        this.lineSeries = this.candleData.lineGraphs.map((g) => {
            return [
                {
                    name: g.name,
                    type: 'line',
                    data: g.data,
                },
            ]
        })
    }

    get refs(): any {
        return this.$refs
    }

    get chartOptions() {
        return {
            chart: {
                id: 'candles',
                toolbar: {
                    autoSelected: 'pan',
                    show: false,
                    tools: {
                        pan: false,
                    },
                },
                zoom: {
                    enabled: true,
                },
                animations: {
                    enabled: false,
                },
            },
            title: {
                text: '',
                align: 'left',
            },
            annotations: {
                xaxis: this.candleData.annotations,
            },
            xaxis: {
                type: 'datetime',
                min: this.range.start,
                max: this.range.end,
                labels: {
                    show: true,
                    formatter: function (_value: any, timestamp: number) {
                        return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
                    },
                    rotate: -45,
                    rotateAlways: true,
                },
            },
            yaxis: {
                min: this.candleData.minY,
                max: this.candleData.maxY,
                labels: {
                    show: true,
                    formatter: (value: any) => {
                        return Math.floor(value * 1000) / 1000
                    },
                },
            },
            stroke: {
                width: [1, 1],
            },
            legend: {
                show: true,
                showForNullSeries: false,
                showForZeroSeries: false,
                onItemClick: {
                    toggleDataSeries: false,
                },
                onItemHover: {
                    highlightDataSeries: false,
                },
                offsetY: 16,
                height: 32,
            },
            tooltip: {
                enabled: false,
            },
        }
    }

    get series() {
        const alwaysVisible: any[] = [
            {
                name: 'ティック',
                type: 'candlestick',
                data: this.candleData.candles,
            },
        ]
        const rateGraphs: any[] = this.candleData.rateGraphs
        return alwaysVisible.concat(rateGraphs)
    }

    get lineCharts() {
        return this.candleData.lineGraphs
    }
}
</script>

<style>
.candle-tool-tip {
    padding: 8px;
    background-color: #f5f5f5;
}
.candle-tool-tip-item {
    display: flex;
}
.candle-tool-tip-value {
    font-weight: bold;
}
</style>
