<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
            <v-card-title>
                <span class="headline">リアルトレード設定追加</span>
            </v-card-title>
            <div class="dialog-container d-flex justify-start flex-column">
                <div>
                    <v-select v-model="selectedAgent" :items="agents" label="エージェント" :error-messages="agentError"></v-select>
                    <v-textarea v-model="agentParameters" no-resize outlined label="パラメータ(JSON)"></v-textarea>
                </div>
            </div>
            <div class="d-flex justify-end dialog-actions">
                <div class="d-flex">
                    <v-btn color="error" text @click="hideThis">キャンセル</v-btn>
                    <v-btn color="primary" text @click="addSetting">追加</v-btn>
                </div>
            </div>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Prop, Watch, Vue } from 'vue-property-decorator'
import { Component } from 'vue-mixin-decorator'
import AgentFileEntity from 'models/responses/AgentFileEntity'
import TradeSettingEntity from 'models/responses/TradeSettingEntity'
import StringUtil from 'models/utils/StringUtil'

@Component
export default class TradeSettingCreateDialog extends Vue {
    @Prop(Boolean) readonly dialog!: boolean

    selectedAgent: string | null = null
    agentParameters: string | null = null
    agentError: string | null = null

    @Watch('dialog')
    onChildChanged(dialog: boolean) {
        if (dialog === false) {
            this.selectedAgent = null
            this.agentParameters = null
            this.resetError()
        }
    }

    get agents() {
        return this.$store.state.app.agents.map((a: AgentFileEntity) => {
            return a.name
        })
    }

    addSetting() {
        if (this.validate()) {
            return
        }
        if (this.selectedAgent == null) {
            return
        }
        const agentParameters = this.agentParameters != null ? JSON.parse(this.agentParameters) : null
        const setting = new TradeSettingEntity(StringUtil.randomString(), this.selectedAgent, agentParameters)
        this.$emit('add', setting)
        this.$emit('hide')
    }

    private validate(): boolean {
        this.resetError()
        if (this.selectedAgent == null) {
            this.agentError = 'エージェントを設定してください'
        }
        return this.agentError != null
    }

    private resetError() {
        this.agentError = null
    }

    hideThis() {
        this.$emit('hide')
    }
}
</script>

<style scoped>
.dialog-container {
    padding: 24px;
}
.dialog-actions {
    margin-top: auto;
    padding: 12px;
}
</style>
