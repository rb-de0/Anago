<template>
    <v-container fluid fill-height class="align-content-start">
        <v-container fill-height>
            <v-row class="realtrade-content">
                <v-col :class="{ 'd-none': hasDetail, 'd-sm-block': hasDetail }" class="realtrade-menu pa-0" cols="12" sm="3" xs="12">
                    <v-list dense class="pa-0">
                        <router-link class="realtrade-menu-item" tag="v-list-item" :class="{ 'grey lighten-3': $route.path == '/trades/rate' }" :to="{ path: `/trades/rate` }">
                            <v-list-item-content>
                                <v-list-item-title class="text-subtitle-2 font-weight-medium">レート</v-list-item-title>
                            </v-list-item-content>
                        </router-link>
                        <router-link class="realtrade-menu-item" tag="v-list-item" :class="{ 'grey lighten-3': $route.path == '/trades/status' }" :to="{ path: `/trades/status` }">
                            <v-list-item-content>
                                <v-list-item-title class="text-subtitle-2 font-weight-medium">取引状況</v-list-item-title>
                            </v-list-item-content>
                        </router-link>
                        <router-link class="realtrade-menu-item" tag="v-list-item" :class="{ 'grey lighten-3': $route.path == '/trades/positions' }" :to="{ path: `/trades/positions` }">
                            <v-list-item-content>
                                <v-list-item-title class="text-subtitle-2 font-weight-medium">ポジション</v-list-item-title>
                            </v-list-item-content>
                        </router-link>
                        <router-link class="realtrade-menu-item" tag="v-list-item" :class="{ 'grey lighten-3': $route.path == '/trades/settings' }" :to="{ path: `/trades/settings` }">
                            <v-list-item-content>
                                <v-list-item-title class="text-subtitle-2 font-weight-medium">エージェント設定</v-list-item-title>
                            </v-list-item-content>
                        </router-link>
                        <router-link class="realtrade-menu-item" tag="v-list-item" :class="{ 'grey lighten-3': $route.path == '/trades/instruments' }" :to="{ path: `/trades/instruments` }">
                            <v-list-item-content>
                                <v-list-item-title class="text-subtitle-2 font-weight-medium">通貨設定</v-list-item-title>
                            </v-list-item-content>
                        </router-link>
                        <router-link class="realtrade-menu-item" tag="v-list-item" :class="{ 'grey lighten-3': $route.path == '/trades/logs' }" :to="{ path: `/trades/logs` }">
                            <v-list-item-content>
                                <v-list-item-title class="text-subtitle-2 font-weight-medium">ログ</v-list-item-title>
                            </v-list-item-content>
                        </router-link>
                    </v-list>
                </v-col>
                <v-col :class="{ 'd-none': hasDetail === false, 'd-sm-block': hasDetail === false }" class="realtrade-detail" cols="12" sm="9" xs="12">
                    <router-view></router-view>
                </v-col>
            </v-row>
        </v-container>
    </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'

@Component
export default class RealTrade extends Vue {
    hasDetail: boolean = false

    @Watch('$route', { immediate: true })
    routeChanged(to: any) {
        this.hasDetail = to.path.split('/').length > 2
    }

    mounted() {
        this.$store.commit('updatePageName', 'リアルトレード')
    }
}
</script>

<style scoped>
.realtrade-content {
    height: 100%;
}
.realtrade-menu {
    height: 100%;
}
.realtrade-menu-item {
    padding: 6px 12px;
}
.realtrade-detail {
    height: 100%;
    padding: 0 12px;
}
</style>
