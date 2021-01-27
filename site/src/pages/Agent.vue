<template>
    <v-container fluid fill-height class="align-content-start">
        <v-container fill-height>
            <v-row class="agent-content">
                <v-col :class="{ 'd-none': hasDetail, 'd-sm-block': hasDetail }" class="agent-list pa-0" cols="12" sm="3" xs="12">
                    <v-list dense class="pa-0">
                        <v-list-item-content class="agent-list-header">
                            <v-btn depressed class="fill-width" color="indigo" :loading="loading" @click="createNewAgent">
                                <v-icon color="white">add</v-icon>
                            </v-btn>
                        </v-list-item-content>

                        <router-link
                            v-for="agent in agents"
                            :key="agent.name"
                            :class="{ 'grey lighten-3': agent.name == $route.params.agentName }"
                            class="agent-list-item"
                            tag="v-list-item"
                            :to="{ path: `/agents/${agent.name}` }"
                        >
                            <v-list-item-content>
                                <v-list-item-title class="text-subtitle-2 font-weight-medium">{{ agent.name }}</v-list-item-title>
                            </v-list-item-content>
                        </router-link>
                    </v-list>
                </v-col>
                <v-col :class="{ 'd-none': hasDetail === false, 'd-sm-block': hasDetail === false }" class="agent-detail" cols="12" sm="9" xs="12">
                    <router-view @refresh="refreshAndRedirect"></router-view>
                </v-col>
            </v-row>
        </v-container>
        <div>
            <v-snackbar v-model="createAgentErrorSnackbar" color="error" :timeout="1000">新しいエージェントの作成に失敗しました</v-snackbar>
        </div>
    </v-container>
</template>

<script lang="ts">
import { Watch } from 'vue-property-decorator'
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import Config from 'mixins/Config'

@Component
export default class Agent extends Mixins<Config>(Config) {
    hasDetail: boolean = false
    createDialog: boolean = false
    loading: boolean = false
    createAgentErrorSnackbar: boolean = false

    @Watch('$route', { immediate: true })
    routeChanged(to: any) {
        this.hasDetail = to.params.agentName != null
    }

    mounted() {
        this.$store.commit('updatePageName', 'エージェント')
        this.refresh()
    }

    get agents() {
        return this.$store.state.app.agents
    }

    refresh() {
        this.$store.dispatch('refreshAgents')
    }

    refreshAndRedirect() {
        this.$store.dispatch('refreshAgents')
        this.$router.push('/agents')
    }

    createNewAgent() {
        const csrfToken = this.$store.state.app.csrfToken
        axios
            .post(`${this.baseURL}/agents`, {
                _csrf: csrfToken,
            })
            .then(() => {
                this.refresh()
                this.loading = false
            })
            .catch(() => {
                this.loading = false
                this.createAgentErrorSnackbar = true
            })
    }
}
</script>

<style scoped>
.agent-content {
    height: 100%;
}
.agent-list {
    height: 100%;
}
.agent-list-header {
    padding: 12px;
    width: 100%;
}
.agent-list-item {
    padding: 6px 12px;
}
.agent-detail {
    height: 100%;
    padding: 0 12px;
}
</style>
