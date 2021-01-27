<template>
    <div class="fill-height white">
        <div>
            <trade-setting-create-dialog :dialog="createDialog" @hide="createDialog = false" @add="add"></trade-setting-create-dialog>
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
                <v-row>
                    <v-col cols="12" sm="4" class="pa-1">
                        <v-btn depressed color="white" @click="createDialog = true">
                            <v-icon color="black">add</v-icon>
                        </v-btn>
                        <v-btn depressed color="white" @click="removeSelected">
                            <v-icon color="black">remove</v-icon>
                        </v-btn>
                        <v-list-item
                            v-for="setting in settings"
                            :key="setting._id"
                            :class="{ 'grey lighten-3': selectedSetting != null ? setting._id === selectedSetting._id : false }"
                            @click="select(setting)"
                        >
                            <v-list-item-content>
                                <v-list-item-title class="text-subtitle-2 font-weight-medium">{{ setting.agent }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-col>
                    <v-col cols="12" sm="8" class="pa-1">
                        <div v-if="selectedSetting != null">
                            <div v-if="selectedSetting.parameters != null">
                                <div class="font-weight-bold mb-1">パラメータ</div>
                                <div v-html="selectedSetting.parametersRepresentation"></div>
                            </div>
                            <div v-if="selectedSetting.parameters == null">
                                <div class="font-weight-bold mb-1">パラメータなし</div>
                            </div>
                        </div>
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
import Config from 'mixins/Config'
import TradeSettingEntity from 'models/responses/TradeSettingEntity'
import TradeSettingCreateDialog from 'dialogs/TradeSettingCreateDialog.vue'

@Component({
    components: {
        'trade-setting-create-dialog': TradeSettingCreateDialog,
    },
})
export default class RealTradeSetting extends Mixins<Config>(Config) {
    settings: TradeSettingEntity[] = []
    selectedSetting: TradeSettingEntity | null = null
    createDialog: boolean = false

    loading = false
    applySuccessSnackbar: boolean = false
    applyErrorSnackbar: boolean = false

    mounted() {
        this.refresh()
    }

    apply() {
        this.loading = true
        const csrfToken = this.$store.state.app.csrfToken
        axios
            .post(`${this.baseURL}/trade-settings`, {
                settings: this.settings,
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

    select(setting: TradeSettingEntity) {
        this.selectedSetting = setting
    }

    add(setting: TradeSettingEntity) {
        this.settings.push(setting)
    }

    removeSelected() {
        const selected = this.selectedSetting
        if (selected == null) {
            return
        }
        this.settings = this.settings.filter((s) => {
            return s._id != selected._id
        })
        this.selectedSetting = null
    }

    refresh() {
        axios
            .get(`${this.baseURL}/trade-settings`)
            .then((response) => {
                this.settings = plainToClass(TradeSettingEntity, response.data)
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
