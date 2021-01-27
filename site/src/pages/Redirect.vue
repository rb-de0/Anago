<template>
    <v-app>
        <v-main>
            <v-container fluid fill-height>
                <div class="loading-container d-flex justify-center align-center">
                    <v-progress-circular v-show="loading" :size="50" color="primary" indeterminate></v-progress-circular>
                </div>
            </v-container>
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import Config from 'mixins/Config'

@Component
export default class Redirect extends Mixins<Config>(Config) {
    loading = false
    error: string | null = null

    mounted(): void {
        this.redirect()
    }

    private redirect(): void {
        this.error = null
        this.loading = true
        axios
            .get(`${this.baseURL}/status`)
            .then(() => {
                this.$router.push('/trades/status')
            })
            .catch(() => {
                this.$router.push('/login')
            })
            .then(() => {
                this.loading = false
            })
    }
}
</script>

<style scoped>
.loading-container {
    width: 100%;
    height: 100%;
}
</style>
