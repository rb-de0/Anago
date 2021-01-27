<template>
    <div class="d-flex flex-column align-start">
        <div class="d-flex fill-width pt-2">
            <div class="right-fit">
                <v-btn depressed color="white" @click="restartBacktest">
                    <v-icon>replay</v-icon>
                </v-btn>
                <v-btn depressed color="white" @click="deleteBacktest">
                    <v-icon>delete</v-icon>
                </v-btn>
            </div>
        </div>
        <v-container>
            <v-row>
                <v-col cols="6" sm="3" class="pa-2">
                    <div>バックテスト名</div>
                </v-col>
                <v-col cols="6" sm="9" class="pa-2">
                    <div>{{ backtest.name }}</div>
                </v-col>
            </v-row>
            <v-row v-if="backtest.description != null">
                <v-col cols="6" sm="3" class="pa-2">
                    <div>説明</div>
                </v-col>
                <v-col cols="6" sm="9" class="pa-2">
                    <div>{{ backtest.description }}</div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6" sm="3" class="pa-2">
                    <div>バランス</div>
                </v-col>
                <v-col cols="6" sm="9" class="pa-2">
                    <div>{{ backtest.balance }}</div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6" sm="3" class="pa-2">
                    <div>インターバル</div>
                </v-col>
                <v-col cols="6" sm="9" class="pa-2">
                    <div>{{ backtest.intervalText }}</div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6" sm="3" class="pa-2">
                    <div>通貨ペア</div>
                </v-col>
                <v-col cols="6" sm="9" class="pa-2">
                    <div>{{ backtest.instrumentsText }}</div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6" sm="3" class="pa-2">
                    <div>期間</div>
                </v-col>
                <v-col cols="6" sm="9" class="pa-2">
                    <div>{{ backtest.periodText }}</div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6" sm="3" class="pa-2">
                    <div>ステータス</div>
                </v-col>
                <v-col cols="6" sm="9" class="pa-2">
                    <div>{{ backtest.statusText }}</div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6" sm="3" class="pa-2">
                    <div>エージェント</div>
                </v-col>
                <v-col cols="6" sm="9" class="pa-2">
                    <div>{{ backtest.agent }}</div>
                </v-col>
            </v-row>
            <v-row v-if="backtest.parameters != null">
                <v-col cols="6" sm="3" class="pa-2">
                    <div>パラメータ</div>
                </v-col>
                <v-col cols="6" sm="9" class="pa-2">
                    <div>{{ backtest.parameters }}</div>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import BacktestEntity from 'models/responses/BacktestEntity'

@Component
export default class BacktestDetailInfo extends Vue {
    @Prop(BacktestEntity) readonly backtest!: BacktestEntity

    deleteBacktest() {
        this.$emit('delete')
    }

    restartBacktest() {
        this.$emit('restart')
    }
}
</script>
