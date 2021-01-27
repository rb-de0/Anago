<template>
    <div v-if="tradingResult != null" class="white">
        <div class="d-flex align-center pt-3 pl-2">
            <div class="font-weight-bold text-h5">残高</div>
            <div class="ml-3 text-h5">{{ tradingResult.balance }}円</div>
        </div>
        <v-divider class="mt-2"></v-divider>
        <div class="text-h5 mt-3 ml-2">過去一週間の成績</div>
        <result-view class="ma-2" :tradingResult="tradingResult">></result-view>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import { plainToClass } from 'class-transformer'
import Config from 'mixins/Config'
import TradingResultView from 'views/TradingResultView.vue'
import TradingResultEntity from 'models/responses/TradingResultEntity'

@Component({
    components: {
        'result-view': TradingResultView,
    },
})
export default class RealTradeStatus extends Mixins<Config>(Config) {
    tradingResult: TradingResultEntity | null = null

    mounted() {
        axios
            .get(`${this.baseURL}/status`)
            .then((response) => {
                this.tradingResult = plainToClass(TradingResultEntity, response.data as TradingResultEntity)
            })
            .catch((error) => {
                console.log(error)
            })
    }
}
</script>
