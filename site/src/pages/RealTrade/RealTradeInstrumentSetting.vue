<template>
    <div class="fill-height white">
        <div>
            <v-snackbar v-model="applyErrorSnackbar" color="error" :timeout="1000">設定の反映に失敗しました</v-snackbar>
            <v-snackbar v-model="applySuccessSnackbar" color="success" :timeout="1000">設定を反映しました</v-snackbar>
        </div>
        <div class="d-flex flex-column fill-height">
            <div class="d-flex pa-2">
                <v-btn depressed color="indigo" @click="apply" :loading="loading" class="header-button">
                    <div class="white--text font-weight-bold">反映</div>
                </v-btn>
            </div>
            <v-divider></v-divider>
            <v-container>
                <v-select v-model="selectedInstruments" :items="instruments" chips label="通貨ペア" multiple></v-select>
            </v-container>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import { plainToClass } from 'class-transformer'
import Config from 'mixins/Config'
import InstrumentSettingEntity from 'models/responses/InstrumentSettingEntity'

@Component
export default class RealTradeInstrumentSetting extends Mixins<Config>(Config) {
    selectedInstruments: string[] = []
    get instruments() {
        return this.$store.state.app.instruments
    }

    loading = false
    applySuccessSnackbar: boolean = false
    applyErrorSnackbar: boolean = false

    mounted() {
        this.refresh()
    }

    apply() {
        this.loading = true
        const csrfToken = this.$store.state.app.csrfToken
        const settings = this.selectedInstruments.map((i) => {
            return {
                name: i,
            }
        })
        console.log(this.selectedInstruments)
        axios
            .post(`${this.baseURL}/instrument-settings`, {
                settings: settings,
                _csrf: csrfToken,
            })
            .then(() => {
                this.refresh()
                this.applySuccessSnackbar = true
            })
            .catch(() => {
                this.loading = false
                this.applyErrorSnackbar = true
            })
            .then(() => {
                this.loading = false
            })
    }

    refresh() {
        axios
            .get(`${this.baseURL}/instrument-settings`)
            .then((response) => {
                const settings = plainToClass(InstrumentSettingEntity, response.data)
                this.selectedInstruments = settings.map((s) => {
                    return s.name
                })
            })
            .catch((error) => {
                console.log(error)
            })
    }
}
</script>

<style scoped>
.header-button {
    width: 200px;
}
</style>
