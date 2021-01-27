<template>
    <div class="d-flex flex-column align-start">
        <v-container v-if="tradingResult != null">
            <v-row>
                <v-col cols="12" sm="4" class="pa-2">
                    <div class="font-weight-black">損益</div>
                    <v-card outlined class="my-1">
                        <v-container class="py-1">
                            <v-row class="pb-1 pl-1">
                                <v-col cols="6" class="pa-0"><div>合計</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div :class="{ 'teal--text': tradingResult.profitOrLoss.sumValue >= 0, 'red--text': tradingResult.profitOrLoss.sumValue < 0 }">
                                        {{ tradingResult.profitOrLoss.sumValue }}
                                    </div></v-col
                                >
                            </v-row>
                            <v-row class="pb-1 pl-1">
                                <v-col cols="6" class="pa-0"><div>総利益</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div class="teal--text">{{ tradingResult.profitOrLoss.profitValue }}</div></v-col
                                >
                            </v-row>
                            <v-row class="pl-1">
                                <v-col cols="6" class="pa-0"><div>総損失</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div class="red--text">{{ tradingResult.profitOrLoss.lossValue }}</div></v-col
                                >
                            </v-row>
                        </v-container>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="4" class="pa-2">
                    <div class="font-weight-black">勝率</div>
                    <v-card outlined class="my-1">
                        <v-container class="py-1">
                            <v-row class="pb-1 pl-1">
                                <v-col cols="6" class="pa-0"><div>勝率</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div>{{ tradingResult.winRate.rate }} %</div></v-col
                                >
                            </v-row>
                            <v-row class="pb-1 pl-1">
                                <v-col cols="6" class="pa-0"><div>勝</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div>{{ tradingResult.winRate.win }}</div></v-col
                                >
                            </v-row>
                            <v-row class="pl-1">
                                <v-col cols="6" class="pa-0"><div>負</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div>{{ tradingResult.winRate.lose }}</div></v-col
                                >
                            </v-row>
                        </v-container>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="4" class="pa-2">
                    <div class="font-weight-black">取引回数</div>
                    <v-card outlined class="my-1">
                        <v-container class="py-1">
                            <v-row class="pb-1 pl-1">
                                <v-col cols="6" class="pa-0"><div>合計</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div>{{ tradingResult.tradingCount.sum }}</div></v-col
                                >
                            </v-row>
                            <v-row class="pb-1 pl-1">
                                <v-col cols="6" class="pa-0"><div>決済済み</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div>{{ tradingResult.tradingCount.closed }}</div></v-col
                                >
                            </v-row>
                            <v-row class="pl-1">
                                <v-col cols="6" class="pa-0"><div>未決済</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div>{{ tradingResult.tradingCount.live }}</div></v-col
                                >
                            </v-row>
                        </v-container>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="4" class="pa-2">
                    <div class="font-weight-black">取引数量</div>
                    <v-card outlined class="my-1">
                        <v-container class="py-1">
                            <v-row class="pb-1 pl-1">
                                <v-col cols="6" class="pa-0"><div>最大</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div>{{ tradingResult.tradingUnits.max }}</div></v-col
                                >
                            </v-row>
                            <v-row class="pb-1 pl-1">
                                <v-col cols="6" class="pa-0"><div>最小</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div>{{ tradingResult.tradingUnits.min }}</div></v-col
                                >
                            </v-row>
                            <v-row class="pl-1">
                                <v-col cols="6" class="pa-0"><div>平均</div></v-col>
                                <v-col cols="6" class="pa-0"
                                    ><div>{{ tradingResult.tradingUnits.agv }}</div></v-col
                                >
                            </v-row>
                        </v-container>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container v-if="tradingResult != null">
            <v-row>
                <v-col cols="12" sm="6" class="pa-4">
                    <div class="font-weight-black">通貨ペア</div>
                    <doughnut-graph class="pa-4" :chart-data="instrumentsGraphData"></doughnut-graph>
                </v-col>
                <v-col cols="12" sm="6" class="pa-4">
                    <div class="font-weight-black">売買</div>
                    <doughnut-graph class="pa-4" :chart-data="sellOrBuyGraphData"></doughnut-graph>
                </v-col>
            </v-row>
        </v-container>
        <v-container v-if="tradingResult == null">
            <v-row>
                <v-col cols="12" class="pa-4">
                    <div class="text-center">データがありません</div>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import DoughnutGraphView from 'views/DoughnutGraphView.vue'
import ColorUtil from 'models/utils/ColorUtil'
import TradingResultEntity from 'models/responses/TradingResultEntity'

@Component({
    components: {
        'doughnut-graph': DoughnutGraphView,
    },
})
export default class TradingResultView extends Vue {
    @Prop(TradingResultEntity) readonly tradingResult!: TradingResultEntity

    get sellOrBuyGraphData() {
        const sellOrBuy = this.tradingResult?.sellOrBuyCount
        if (sellOrBuy == null) {
            return null
        }
        return {
            labels: ['売', '買'],
            datasets: [
                {
                    backgroundColor: ['#FF5722', '#009688'],
                    data: [sellOrBuy.sell, sellOrBuy.buy],
                },
            ],
        }
    }

    get instrumentsGraphData() {
        const instrumentCounts = this.tradingResult?.instrumentCounts
        if (instrumentCounts == null) {
            return null
        }
        return {
            labels: instrumentCounts.map((i) => {
                return i.name
            }),
            datasets: [
                {
                    backgroundColor: instrumentCounts.map((i) => {
                        return ColorUtil.colorFrom(i.name)
                    }),
                    data: instrumentCounts.map((i) => {
                        return i.count
                    }),
                },
            ],
        }
    }
}
</script>
