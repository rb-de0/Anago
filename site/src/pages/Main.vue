<template>
    <v-app>
        <v-navigation-drawer class="white" v-model="drawer" fixed app>
            <v-list class="navigation-list">
                <v-list-item class="indigo navigation-list-header">
                    <v-list-item-content>
                        <v-list-item-title class="font-weight-bold text-center title white--text">Anago</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>

                <router-link class="navigation-list-item" tag="v-list-item" :to="{ path: '/trades' }">
                    <v-list-item-content>
                        <v-list-item-title class="text-body-1 font-weight-medium">リアルトレード</v-list-item-title>
                    </v-list-item-content>
                </router-link>

                <router-link class="navigation-list-item" tag="v-list-item" :to="{ path: '/backtests' }">
                    <v-list-item-content>
                        <v-list-item-title class="text-body-1 font-weight-medium">バックテスト</v-list-item-title>
                    </v-list-item-content>
                </router-link>

                <router-link class="navigation-list-item" tag="v-list-item" :to="{ path: '/agents' }">
                    <v-list-item-content>
                        <v-list-item-title class="text-body-1 font-weight-medium">エージェント</v-list-item-title>
                    </v-list-item-content>
                </router-link>

                <router-link class="navigation-list-item" tag="v-list-item" :to="{ path: '/docs' }">
                    <v-list-item-content>
                        <v-list-item-title class="text-body-1 font-weight-medium">APIリファレンス</v-list-item-title>
                    </v-list-item-content>
                </router-link>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar class="indigo" fixed app flat>
            <v-toolbar-title color="white">
                <v-app-bar-nav-icon color="white" class="hidden-lg-and-up" @click="drawer = !drawer"></v-app-bar-nav-icon>
                <span class="white--text font-weight-bold">{{ pageName }}</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
        </v-app-bar>

        <v-main>
            <v-container class="main-container" fluid fill-height>
                <router-view></router-view>
            </v-container>
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Main extends Vue {
    drawer = null

    get pageName() {
        return this.$store.state.app.pageName
    }

    mounted() {
        this.$store.dispatch('refreshAgents')
        this.$store.dispatch('refreshInstruments')
        this.$store.dispatch('refresCSRFToken')
    }
}
</script>

<style scoped>
.main-container {
    background-color: #f5f5f5;
}
.navigation-list {
    padding: unset;
}
.navigation-list-header.v-list-item {
    height: 64px;
}
.navigation-list-item.v-list-item {
    height: 44px;
}
</style>
