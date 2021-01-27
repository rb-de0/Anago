<template>
    <div>
        <v-tabs v-model="activeTab" grow dark　show-arrows background-color="indigo">
            <v-tab v-for="tab of tabs" :key="tab.id">{{ tab.name }}</v-tab>
            <v-tab-item>
                <backtest-detail-info @delete="deleteBacktest" @restart="restartBacktest" v-if="backtest != null" :backtest="backtest"></backtest-detail-info>
            </v-tab-item>
            <v-tab-item>
                <trading-result v-if="result != null" :tradingResult="result"></trading-result>
            </v-tab-item>
            <v-tab-item>
                <backtest-chart v-if="backtest != null" :backtest="backtest"></backtest-chart>
            </v-tab-item>
            <v-tab-item>
                <backtest-detail-position-list v-if="backtest != null" :positions="backtest.positions"></backtest-detail-position-list>
            </v-tab-item>
            <v-tab-item>
                <backtest-detail-log v-if="backtest != null" :logs="backtest.logs"></backtest-detail-log>
            </v-tab-item>
        </v-tabs>
        <div>
            <v-snackbar v-model="deleteBacktestErrorSnackbar" color="error" :timeout="1000">バックテストの削除に失敗しました {{ errorMessage }}</v-snackbar>
            <v-snackbar v-model="restartBacktestErrorSnackbar" color="error" :timeout="1000">バックテストの再スタートに失敗しました {{ errorMessage }}</v-snackbar>
        </div>
    </div>
</template>

<script lang="ts">
import { Prop, Watch } from 'vue-property-decorator'
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import { plainToClass } from 'class-transformer'
import Config from 'mixins/Config'
import BacktestWithResultEntity from 'models/responses/BacktestWithResultEntity'
import BacktestEntity from 'models/responses/BacktestEntity'
import TradingResultEntity from 'models/responses/TradingResultEntity'
import Tab from 'models/viewdata/Tab'
import BacktestDetailInfo from 'pages/BacktestDetail/BacktestDetailInfo.vue'
import BacktestDetailPositionList from 'pages/BacktestDetail/BacktestDetailPositionList.vue'
import TradingResultView from 'views/TradingResultView.vue'
import BacktestDetailLog from 'pages/BacktestDetail/BacktestDetailLog.vue'
import BacktestChart from 'pages/BacktestDetail/BacktestChart.vue'

@Component({
    components: {
        'backtest-detail-info': BacktestDetailInfo,
        'trading-result': TradingResultView,
        'backtest-detail-position-list': BacktestDetailPositionList,
        'backtest-detail-log': BacktestDetailLog,
        'backtest-chart': BacktestChart,
    },
})
export default class BacktestDetail extends Mixins<Config>(Config) {
    @Prop(String) readonly backtestId!: string
    backtest: BacktestEntity | null = null
    result: TradingResultEntity | null = null
    errorMessage: string | null = null
    deleteBacktestErrorSnackbar: boolean = false
    restartBacktestErrorSnackbar: boolean = false
    activeTab = 0
    tabs = [new Tab(1, 'バックテスト概要'), new Tab(2, '取引結果'), new Tab(3, 'チャート'), new Tab(4, 'ポジション'), new Tab(5, 'ログ')]

    @Watch('backtestId', { immediate: true })
    backtestChanged() {
        this.refresh()
    }

    refresh() {
        axios
            .get(`${this.baseURL}/backtests/${this.backtestId}`)
            .then((response) => {
                const withResult = plainToClass(BacktestWithResultEntity, response.data as BacktestWithResultEntity)
                this.backtest = withResult.backtest
                this.result = withResult.tradingResult
            })
            .catch((error) => {
                console.log(error)
            })
    }

    deleteBacktest() {
        const csrfToken = this.$store.state.app.csrfToken
        axios
            .delete(`${this.baseURL}/backtests/${this.backtestId}`, {
                data: { _csrf: csrfToken },
            })
            .then(() => {
                this.$emit('refresh')
            })
            .catch((error) => {
                this.errorMessage = error.response.data.errorMessage
                this.deleteBacktestErrorSnackbar = true
            })
    }

    restartBacktest() {
        const csrfToken = this.$store.state.app.csrfToken
        axios
            .post(`${this.baseURL}/backtests/${this.backtestId}/restart`, {
                _csrf: csrfToken,
            })
            .then(() => {
                this.$emit('refresh')
            })
            .catch((error) => {
                this.errorMessage = error.response.data.errorMessage
                this.deleteBacktestErrorSnackbar = true
            })
    }
}
</script>
