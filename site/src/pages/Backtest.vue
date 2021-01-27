<template>
    <v-container fluid fill-height class="align-content-start">
        <div>
            <backtest-create-dialog :dialog="createDialog" @hide="hideCreateDialog" @refresh="refresh"></backtest-create-dialog>
        </div>
        <v-container fill-height>
            <v-row class="backtest-content">
                <v-col :class="{ 'd-none': hasDetail, 'd-sm-block': hasDetail }" class="backtest-list pa-0" cols="12" sm="3" xs="12">
                    <v-list class="pa-0">
                        <v-list-item-content class="backtest-list-header">
                            <v-btn depressed class="fill-width" color="indigo" @click="showCreateDialog">
                                <v-icon color="white">add</v-icon>
                            </v-btn>
                        </v-list-item-content>

                        <router-link
                            v-for="backtest in backtests"
                            :key="backtest.id"
                            :class="{ 'grey lighten-3': backtest.id == $route.params.backtestId }"
                            class="backtest-list-item"
                            tag="v-list-item"
                            :to="{ path: `/backtests/${backtest.id}` }"
                        >
                            <v-list-item-content>
                                <v-list-item-title class="text-subtitle-2 font-weight-medium">{{ backtest.name }}</v-list-item-title>
                                <v-list-item-subtitle class="text-subtitle-2 mt-1" :class="{ 'red--text': backtest.status === 'FinishWithError' }">{{ backtest.statusText }}</v-list-item-subtitle>
                                <v-progress-linear v-if="backtest.progress > 0" color="indigo" class="mt-1" :value="backtest.progress"></v-progress-linear>
                            </v-list-item-content>
                        </router-link>
                    </v-list>
                </v-col>
                <v-col :class="{ 'd-none': hasDetail === false, 'd-sm-block': hasDetail === false }" class="backtest-detail" cols="12" sm="9" xs="12">
                    <router-view @refresh="refresh"></router-view>
                </v-col>
            </v-row>
        </v-container>
    </v-container>
</template>

<script lang="ts">
import { Watch } from 'vue-property-decorator'
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import { plainToClass } from 'class-transformer'
import BacktestCreateDialog from 'dialogs/BacktestCreateDialog.vue'
import Config from 'mixins/Config'
import BacktestEntity from 'models/responses/BacktestEntity'

@Component({
    components: {
        'backtest-create-dialog': BacktestCreateDialog,
    },
})
export default class Backtest extends Mixins<Config>(Config) {
    hasDetail: boolean = false
    createDialog: boolean = false
    backtests: BacktestEntity[] = []

    @Watch('$route', { immediate: true })
    routeChanged(to: any) {
        this.hasDetail = to.params.backtestId != null
    }

    mounted() {
        this.$store.commit('updatePageName', 'バックテスト')
        this.refresh()
    }

    refresh() {
        axios
            .get(`${this.baseURL}/backtests`)
            .then((response) => {
                this.backtests = plainToClass(BacktestEntity, response.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    showCreateDialog() {
        this.createDialog = true
    }

    hideCreateDialog() {
        this.createDialog = false
    }
}
</script>

<style scoped>
.backtest-content {
    height: 100%;
}
.backtest-list {
    height: 100%;
}
.backtest-list-header {
    padding: 12px;
    width: 100%;
}
.backtest-list-item {
    padding: 6px 12px;
}
.backtest-detail {
    height: 100%;
    padding: 0 12px;
}
</style>
