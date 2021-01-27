<template>
    <div class="white">
        <div class="d-flex pa-2 pt-6">
            <v-select class="pa-2" v-model="instrument" :items="instruments" label="通貨ペア" @change="instrumentChanged"></v-select>
            <v-select class="pa-2" v-model="interval" :items="intervals" label="インターバル" @change="intervalChanged"></v-select>
        </div>
        <div class="d-flex justify-end pa-4">
            <div class="d-flex font-weight-bold grey--text text--darken-1">
                <div class="mr-2">表示期間</div>
                <div>{{ visibleStartDate }} 〜 {{ visibleEndDate }}</div>
            </div>
        </div>
        <div>
            <v-slider class="mx-2" color="indigo" step="10000" v-if="sliderVisible && candleDataList != null" v-model="sliderValue" :min="sliderStart" :max="sliderEnd" @end="endScrolling"></v-slider>
        </div>
        <chart class="pa-2" v-if="candleDataList != null" :range="candleRange" :candleData="candleDataList" @refresh="fetchCandles"></chart>
    </div>
</template>

<script lang="ts">
import moment from 'moment'
import { Watch } from 'vue-property-decorator'
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import { plainToClass } from 'class-transformer'
import CandleStickChartView from 'views/CandleStickChartView.vue'
import Config from 'mixins/Config'
import CandlesEntity from 'models/responses/CandlesEntity'
import CandleData from 'models/viewdata/CandleData'
import CandleDataList from 'models/viewdata/CandleDataList'
import CandleChartRange from 'models/viewdata/CandleChartRange'
import IntervalUtil from 'models/utils/IntervalUtil'
import InstrumentsEntity from 'models/responses/InstrumentsEntity'
import SelectedInstrumentEntity from 'models/responses/SelectedInstrumentEntity'

@Component({
    components: {
        chart: CandleStickChartView,
    },
})
export default class RealTradeChart extends Mixins<Config>(Config) {
    candleDataList: CandleDataList | null = null
    candleRange: CandleChartRange | null = null

    interval = ''
    intervals: string[] = []

    instrument = ''
    instruments: string[] = []

    sliderValue = 0
    sliderStart = 0
    sliderEnd = 0
    sliderVisible = false

    startDate!: Date
    endDate!: Date

    get visibleStartDate() {
        if (this.candleRange == null) {
            return ''
        }
        return moment(this.candleRange.start).format('YYYY-MM-DD HH:mm:ss')
    }

    get visibleEndDate() {
        if (this.candleRange == null) {
            return ''
        }
        return moment(this.candleRange.end).format('YYYY-MM-DD HH:mm:ss')
    }

    mounted() {
        this.fetchInstruments()
    }

    private setup() {
        if (this.instruments.length === 0) {
            return
        }
        if (this.instrument === '') {
            return
        }
        const now = moment()
        const minutes = now.minute() % 5
        const seconds = now.second()
        const diff = minutes * 60 + seconds
        this.endDate = now.add(-diff, 'seconds').toDate()
        this.startDate = moment(this.endDate).add(-100, 'days').toDate()
        const util = new IntervalUtil()
        this.intervals = util.relations.map((r) => {
            return r.display
        })
        this.interval = util.relations[0].display
        this.refresh()
    }

    intervalChanged() {
        this.refresh()
    }

    instrumentChanged() {
        this.refresh()
        this.updateInstrument()
    }

    @Watch('sliderValue', { immediate: true })
    sliderValieChanged() {
        this.updateRange()
    }

    endScrolling() {
        this.fetchCandles()
    }

    private refresh() {
        this.candleDataList = null
        this.setupSliderRange()
        this.updateRange()
        this.fetchCandles()
    }

    private setupSliderRange() {
        this.sliderStart = this.rangeFixed(moment(this.startDate), true).toDate().getTime()
        this.sliderEnd = this.endDate.getTime()
        this.sliderValue = this.sliderEnd
        this.sliderVisible = this.rangeFixed(moment(this.startDate), true).isBefore(moment(this.endDate))
    }

    private updateRange() {
        const end = this.sliderValue
        const start = this.rangeFixed(moment(end), false).toDate().getTime()
        this.candleRange = new CandleChartRange(start, end)
    }

    private rangeFixed(moment: moment.Moment, adding: boolean): moment.Moment {
        const intervalParameter = new IntervalUtil().convertToDomainValue(this.interval) ?? 'M1'
        const numberOfCandles = adding ? 100 : -100
        switch (intervalParameter) {
            case 'S15':
                moment.add(numberOfCandles * 15, 'seconds')
                break
            case 'M1':
                moment.add(numberOfCandles, 'minutes')
                break
            case 'M15':
                moment.add(numberOfCandles * 15, 'minutes')
                break
            case 'M30':
                moment.add(numberOfCandles * 30, 'minutes')
                break
            case 'H1':
                moment.add(numberOfCandles, 'hours')
                break
            case 'H6':
                moment.add(numberOfCandles * 6, 'hours')
                break
            case 'D':
                moment.add(numberOfCandles, 'days')
                break
        }
        return moment
    }

    private fetchInstruments() {
        axios
            .get(`${this.baseURL}/instruments`)
            .then((response) => {
                const instruments = plainToClass(InstrumentsEntity, response.data as InstrumentsEntity)
                this.fetchInstrument(instruments)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    private fetchInstrument(instruments: InstrumentsEntity) {
        axios
            .get(`${this.baseURL}/user/instrument`)
            .then((response) => {
                const instrument = plainToClass(SelectedInstrumentEntity, response.data as SelectedInstrumentEntity)
                this.instruments = instruments.instruments.map((i) => {
                    return i.name
                })
                this.instrument = instrument.instrument ?? this.instruments[0]
                this.setup()
            })
            .catch((error) => {
                console.log(error)
            })
    }

    private updateInstrument() {
        if (this.instrument === '') {
            return
        }
        const csrfToken = this.$store.state.app.csrfToken
        axios
            .post(`${this.baseURL}/user/instrument`, {
                instrument: this.instrument,
                _csrf: csrfToken,
            })
            .catch((error) => {
                console.log(error)
            })
    }

    fetchCandles() {
        if (this.candleRange == null) {
            return
        }
        const startDate = moment(this.candleRange.start)
        const endDate = moment(this.candleRange.end)
        const from = startDate.format()
        const to = endDate.format()
        const intervalParameter = new IntervalUtil().convertToDomainValue(this.interval) ?? 'M1'
        axios
            .get(`${this.baseURL}/candles`, {
                params: {
                    to: to,
                    from: from,
                    interval: intervalParameter,
                    instrument: this.instrument,
                },
            })
            .then((response) => {
                if (this.candleRange == null) {
                    return
                }
                const candles = plainToClass(CandlesEntity, response.data as CandlesEntity)
                const candleData = CandleData.makeFrom(candles)
                this.candleDataList = new CandleDataList(this.startDate, this.endDate, this.candleRange, candleData, [], [])
            })
    }
}
</script>
