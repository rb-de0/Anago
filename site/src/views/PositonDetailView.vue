<template>
    <v-container class="position-detail">
        <div class="d-flex align-center profit-or-loss">
            <div class="font-weight-bold">損益</div>
            <div class="ml-3 text-h5" :class="{ 'teal--text': position.profitOrLoss >= 0, 'red--text': position.profitOrLoss < 0 }">{{ position.profitOrLoss }}</div>
        </div>
        <v-row>
            <v-col cols="12" lg="3" class="px-2 py-0">
                <v-container>
                    <v-row class="pb-1">
                        <v-col cols="3" class="pa-0"><div class="font-weight-bold">状態</div></v-col>
                        <v-col cols="9" class="pa-0"
                            ><div :class="{ 'teal--text': position.status === '決済済み', 'red--text': position.status === '未決済' }">
                                {{ position.status }}
                            </div></v-col
                        >
                    </v-row>
                    <v-row class="pb-1">
                        <v-col cols="3" class="pa-0"><div class="font-weight-bold">通貨ペア</div></v-col>
                        <v-col cols="9" class="pa-0"
                            ><div>{{ position.instrument }}</div></v-col
                        >
                    </v-row>
                    <v-row class="pb-1">
                        <v-col cols="3" class="pa-0"><div class="font-weight-bold">売/買</div></v-col>
                        <v-col cols="9" class="pa-0"
                            ><div>{{ position.sellOrBuy }}</div></v-col
                        >
                    </v-row>
                    <v-row class="pb-1">
                        <v-col cols="3" class="pa-0"><div class="font-weight-bold">数量</div></v-col>
                        <v-col cols="9" class="pa-0"
                            ><div>{{ position.units }}</div></v-col
                        >
                    </v-row>
                </v-container>
            </v-col>
            <v-col cols="12" lg="3" class="px-2 py-0">
                <v-container>
                    <v-row class="pb-1">
                        <v-col cols="3" class="pa-0"><div class="font-weight-bold">購入価格</div></v-col>
                        <v-col cols="9" class="pa-0"
                            ><div>{{ position.entryPrice }}</div></v-col
                        >
                    </v-row>
                    <v-row class="pb-1">
                        <v-col cols="3" class="pa-0"><div class="font-weight-bold">決済価格</div></v-col>
                        <v-col cols="9" class="pa-0"
                            ><div>{{ position.closePrice }}</div></v-col
                        >
                    </v-row>
                    <v-row class="pb-1">
                        <v-col cols="3" class="pa-0"><div class="font-weight-bold">購入日時</div></v-col>
                        <v-col cols="9" class="pa-0"
                            ><div>{{ position.entriedAt }}</div></v-col
                        >
                    </v-row>
                    <v-row class="pb-1">
                        <v-col cols="3" class="pa-0"><div class="font-weight-bold">決済日時</div></v-col>
                        <v-col cols="9" class="pa-0"
                            ><div>{{ position.closedAt }}</div></v-col
                        >
                    </v-row>
                </v-container>
            </v-col>
            <v-col cols="12" lg="6" class="px-2 py-0">
                <div class="d-flex">
                    <div class="right-fit">
                        <div class="font-weight-bold text-subtitle-1">決済条件</div>
                        <v-card outlined min-width="344">
                            <v-container class="closing-policy">
                                <v-row class="pb-1 pl-1">
                                    <v-col cols="5" class="pa-0"><div class="font-weight-bold">トレールストップ</div></v-col>
                                    <v-col cols="7" class="pa-0"
                                        ><div v-if="position.closingPolicy.trailingStopDistance != null">{{ position.closingPolicy.trailingStopDistance }}</div>
                                        <div v-if="position.closingPolicy.trailingStopDistance == null">なし</div></v-col
                                    >
                                </v-row>
                                <v-row class="pb-1 pl-1">
                                    <v-col cols="5" class="pa-0"><div class="font-weight-bold">利益確定</div></v-col>
                                    <v-col cols="7" class="pa-0"
                                        ><div v-if="position.closingPolicy.takeProfitPrice != null">{{ position.closingPolicy.takeProfitPrice }}</div>
                                        <div v-if="position.closingPolicy.takeProfitPrice == null">なし</div></v-col
                                    >
                                </v-row>
                                <v-row class="pb-0 pl-1">
                                    <v-col cols="5" class="pa-0"><div class="font-weight-bold">ロスカット</div></v-col>
                                    <v-col cols="7" class="pa-0"
                                        ><div v-if="position.closingPolicy.stopLossPrice != null">{{ position.closingPolicy.stopLossPrice }}</div>
                                        <div v-if="position.closingPolicy.stopLossPrice == null">なし</div></v-col
                                    >
                                </v-row>
                            </v-container>
                        </v-card>
                    </div>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import PositionTableData from 'models/viewdata/PositionTableData'

@Component
export default class PositionDetailView extends Vue {
    @Prop(PositionTableData) readonly position!: PositionTableData
}
</script>

<style scoped>
.position-detail {
    font-size: 14px;
    padding: 0px 24px;
}
.profit-or-loss {
    margin-left: -4px;
    padding-top: 20px;
}
.closing-policy {
    padding: 4px 12px;
}
</style>
