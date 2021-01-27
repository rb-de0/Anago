<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
        <div>
            <date-picker-dialog :dialog="startDateDialog" :date="startDate" @hide="hideStartDateDialog" @apply="applyStartDate"></date-picker-dialog>
            <date-picker-dialog :dialog="endDateDialog" :date="endDate" @hide="hideEndDateDialog" @apply="applyEndDate"></date-picker-dialog>
        </div>
        <v-card>
            <v-card-title>
                <span class="headline">バックテスト作成</span>
            </v-card-title>
            <div class="dialog-container d-flex justify-start flex-column">
                <div class="scroll-content">
                    <v-text-field label="名前" v-model="name" :error-messages="nameError"></v-text-field>
                    <v-text-field label="説明" v-model="description"></v-text-field>
                    <v-text-field label="バランス" v-model="balance"></v-text-field>
                    <v-select v-model="selectedInterval" :items="intervals" label="インターバル" :error-messages="intervalError"></v-select>
                    <v-select v-model="selectedAgent" :items="agents" label="エージェント" :error-messages="agentError"></v-select>
                    <v-textarea v-model="agentParameters" no-resize outlined label="パラメータ(JSON)"></v-textarea>
                    <v-select v-model="selectedInstruments" :items="instruments" chips label="通貨ペア" multiple :error-messages="instrumentError"></v-select>
                    <v-text-field v-model="startDate" placeholder="開始日" prepend-icon="event" readonly @click="showStartDateDialog" :error-messages="startDateError"></v-text-field>
                    <v-text-field v-model="endDate" placeholder="終了日" prepend-icon="event" readonly @click="showEndDateDialog" :error-messages="endDateError"></v-text-field>
                </div>
            </div>
            <div class="d-flex justify-end dialog-actions">
                <div class="d-flex">
                    <v-btn color="error" text @click="hideThis">キャンセル</v-btn>
                    <v-btn color="primary" text :loading="loading" @click="register">作成</v-btn>
                </div>
            </div>
        </v-card>
        <div>
            <v-snackbar v-model="createBacktestErrorSnackbar" color="error" :timeout="1000">バックテストの作成に失敗しました</v-snackbar>
        </div>
    </v-dialog>
</template>

<script lang="ts">
import { Prop, Watch } from 'vue-property-decorator'
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import moment from 'moment'
import Config from 'mixins/Config'
import DatePickerDialog from 'dialogs/date/DatePickerDialog.vue'
import AgentFileEntity from 'models/responses/AgentFileEntity'
import IntervalUtil from 'models/utils/IntervalUtil'

@Component({
    components: {
        'date-picker-dialog': DatePickerDialog,
    },
})
export default class BacktestCreateDialog extends Mixins<Config>(Config) {
    @Prop(Boolean) readonly dialog!: boolean
    intervals: string[] = []

    name = ''
    description: string | null = null
    balance: string | null = null
    selectedInterval: string | null = null
    selectedAgent: string | null = null
    selectedInstruments: string[] = []
    startDate: string | null = null
    endDate: string | null = null
    agentParameters: string | null = null

    nameError: string | null = null
    intervalError: string | null = null
    instrumentError: string | null = null
    agentError: string | null = null
    startDateError: string | null = null
    endDateError: string | null = null

    loading: boolean = false
    startDateDialog: boolean = false
    endDateDialog: boolean = false
    createBacktestErrorSnackbar: boolean = false

    get agents() {
        return this.$store.state.app.agents.map((a: AgentFileEntity) => {
            return a.name
        })
    }

    get instruments() {
        return this.$store.state.app.instruments
    }

    mounted() {
        this.intervals = new IntervalUtil().relations.map((r) => {
            return r.display
        })
    }

    @Watch('dialog')
    onChildChanged(dialog: boolean) {
        if (dialog === false) {
            this.name = ''
            this.description = null
            this.balance = null
            this.selectedInterval = null
            this.selectedAgent = null
            this.agentParameters = null
            this.selectedInstruments = []
            this.startDate = null
            this.endDate = null
            this.resetError()
        }
    }

    register() {
        if (this.validate()) {
            return
        }
        if (this.selectedInterval == null) {
            return
        }
        this.loading = true
        const startDateParameter = moment(this.startDate).format()
        const endDateParameter = moment(this.endDate).format()
        const intervalParameter = new IntervalUtil().convertToDomainValue(this.selectedInterval)
        const agentParameters = this.agentParameters != null ? JSON.parse(this.agentParameters) : null
        const csrfToken = this.$store.state.app.csrfToken
        axios
            .post(`${this.baseURL}/backtests`, {
                name: this.name,
                description: this.description,
                balance: this.balance,
                startDate: startDateParameter,
                endDate: endDateParameter,
                interval: intervalParameter,
                agent: this.selectedAgent,
                instruments: this.selectedInstruments,
                parameters: agentParameters,
                _csrf: csrfToken,
            })
            .then(() => {
                this.$emit('refresh')
                this.hideThis()
            })
            .catch(() => {
                this.createBacktestErrorSnackbar = true
                this.loading = false
            })
            .then(() => {
                this.loading = false
            })
    }

    private validate(): boolean {
        this.resetError()
        if (this.name.length <= 0) {
            this.nameError = '名前は必須です'
        }
        if (this.selectedInterval == null) {
            this.intervalError = 'インターバルを選択してください'
        }
        if (this.selectedAgent == null) {
            this.agentError = 'エージェントを設定してください'
        }
        if (this.selectedInstruments.length <= 0) {
            this.instrumentError = '通貨ペアを選択してください'
        }
        if (this.startDate == null) {
            this.startDateError = '開始日時を選択してください'
        }
        if (this.endDate == null) {
            this.endDateError = '終了日時を選択してください'
        }
        return this.hasError()
    }

    private hasError(): boolean {
        const errors = [this.nameError, this.intervalError, this.agentError, this.instrumentError, this.startDateError, this.endDateError]
        return (
            errors.filter((e) => {
                return e != null
            }).length > 0
        )
    }

    private resetError() {
        this.nameError = null
        this.intervalError = null
        this.agentError = null
        this.instrumentError = null
        this.startDateError = null
        this.endDateError = null
    }

    showStartDateDialog() {
        this.startDateDialog = true
    }

    hideStartDateDialog() {
        this.startDateDialog = false
    }

    applyStartDate(date: string) {
        this.startDate = date
        this.startDateDialog = false
    }

    showEndDateDialog() {
        this.endDateDialog = true
    }

    hideEndDateDialog() {
        this.endDateDialog = false
    }

    applyEndDate(date: string) {
        this.endDate = date
        this.endDateDialog = false
    }

    hideThis() {
        this.$emit('hide')
    }
}
</script>

<style scoped>
.dialog-container {
    padding: 24px;
    height: 600px;
}
.scroll-content {
    overflow-y: scroll;
    -ms-overflow-style: none;
}
.scroll-content::-webkit-scrollbar {
    display: none;
}
.dialog-actions {
    margin-top: auto;
    padding: 12px;
}
</style>
