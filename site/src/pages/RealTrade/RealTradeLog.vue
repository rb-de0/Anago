<template>
    <div>
        <div v-if="logs != null">
            <v-list v-if="logs.length > 0" dense class="log-list" height="600px">
                <v-list-item class="log-list-item" v-for="log in logs" :key="log._id">
                    <v-list-item-content class="log-list-item-content">
                        <v-list-item-title :class="{ 'red--text': log.level === 'error' }">{{ log.messageText }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <v-container v-if="logs.length === 0">
                <v-row>
                    <v-col cols="12" class="pa-4">
                        <div class="text-center">ログデータがありません</div>
                    </v-col>
                </v-row>
            </v-container>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import { plainToClass } from 'class-transformer'
import LogEntity from 'models/responses/LogEntity'
import Config from 'mixins/Config'

@Component
export default class RealTradeLog extends Mixins<Config>(Config) {
    logs: LogEntity[] | null = null

    mounted() {
        this.refresh()
    }

    refresh() {
        axios
            .get(`${this.baseURL}/logs`)
            .then((response) => {
                this.logs = plainToClass(LogEntity, response.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }
}
</script>

<style scoped>
.log-list {
    overflow-y: scroll;
}
.log-list-item {
    min-height: 24px;
}
.log-list-item .log-list-item-content {
    padding: 0;
}
</style>
