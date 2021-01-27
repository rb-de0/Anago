<template>
    <v-app>
        <v-main>
            <v-container fluid fill-height>
                <div>
                    <v-snackbar v-model="loginErrorSnackbar" color="error" :timeout="5000">ログインに失敗しました {{ error }} </v-snackbar>
                </div>
                <v-row align="center" justify="center" text-center>
                    <v-col cols="12" sm="4" xs="12">
                        <div class="center-content white pa-4">
                            <div class="grey--text text--darken-3 text-center display-3 mb-3">
                                Anago
                            </div>
                            <form>
                                <v-text-field v-model="username" label="ユーザー名" class="mb-3" solo flat outlined></v-text-field>
                                <v-text-field v-model="password" label="パスワード" class="mb-3" :type="'password'" solo flat outlined></v-text-field>
                                <v-btn @click="submit" block :loading="loading" color="indigo" dark>ログイン</v-btn>
                            </form>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import Config from 'mixins/Config'

@Component
export default class Login extends Mixins<Config>(Config) {
    username = ''
    password = ''
    loading = false
    error: string | null = null
    loginErrorSnackbar: boolean = false

    submit(): void {
        this.login()
    }

    private login(): void {
        this.error = null
        this.loading = true
        axios
            .post(`${this.baseURL}/login`, {
                username: this.username,
                password: this.password,
            })
            .then(() => {
                this.$router.push('/trades/status')
            })
            .catch((error) => {
                this.error = error.response.data
                this.loginErrorSnackbar = true
            })
            .then(() => {
                this.loading = false
            })
    }
}
</script>

<style scoped>
.center-content form .v-text-field {
    height: 48px;
}
</style>

<style>
.v-input__control {
    min-height: 46px !important;
}
</style>
