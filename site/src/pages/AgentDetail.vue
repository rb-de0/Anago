<template>
    <div class="fill-height">
        <div class="d-flex flex-column fill-height">
            <div class="code-editor-header d-flex">
                <v-btn class="no-decoration" @click="showNameEditDialog" text>{{ agentName }}</v-btn>
                <div class="d-flex right-fit">
                    <v-btn depressed @click="deleteAgent">
                        <v-icon>delete</v-icon>
                    </v-btn>
                    <v-btn depressed :loading="loading" @click="update">
                        <v-icon>save</v-icon>
                    </v-btn>
                </div>
            </div>
            <div class="code-editor">
                <code-editor v-model="code" :highlight="highlighter" line-numbers></code-editor>
            </div>
        </div>
        <div>
            <filename-edit-dialog :name="agentName" :dialog="fileNameEditDialog" @hide="hideNameEditDialog" @refresh="refreshAgents"></filename-edit-dialog>
            <v-snackbar v-model="updateAgentErrorSnackbar" color="error" :timeout="5000">エージェントの更新に失敗しました {{ errorMessage }}</v-snackbar>
            <v-snackbar v-model="updateAgentSuccessSnackbar" color="success" :timeout="1000">エージェントを更新しました</v-snackbar>
            <v-snackbar v-model="deleteAgentErrorSnackbar" color="error" :timeout="1000">エージェントの削除に失敗しました {{ errorMessage }}</v-snackbar>
        </div>
    </div>
</template>

<script lang="ts">
import { Prop, Watch } from 'vue-property-decorator'
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import { plainToClass } from 'class-transformer'
import { PrismEditor } from 'vue-prism-editor'
import Config from 'mixins/Config'
import AgentBodyEntity from 'models/responses/AgentBodyEntity'
import AgentFileNameEditDialog from 'dialogs/AgentFileNameEditDialog.vue'
import 'vue-prism-editor/dist/prismeditor.min.css'
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/themes/prism-coy.css'

@Component({
    components: {
        'code-editor': PrismEditor,
        'filename-edit-dialog': AgentFileNameEditDialog,
    },
})
export default class AgentDetail extends Mixins<Config>(Config) {
    @Prop(String) readonly agentName!: string
    code: string = ''
    loading: boolean = false
    updateAgentSuccessSnackbar: boolean = false
    updateAgentErrorSnackbar: boolean = false
    deleteAgentErrorSnackbar: boolean = false
    errorMessage: string | null = null
    fileNameEditDialog: boolean = false

    @Watch('agentName', { immediate: true })
    agentChanged() {
        this.refresh()
    }

    mounted() {
        this.refresh()
    }

    highlighter(code: any) {
        return highlight(code, languages.ts)
    }

    private refresh() {
        axios
            .get(`${this.baseURL}/agent-body`, {
                params: {
                    name: this.agentName,
                },
            })
            .then((response) => {
                const body = plainToClass(AgentBodyEntity, response.data as AgentBodyEntity)
                this.code = body.body
            })
    }

    update() {
        this.loading = true
        const csrfToken = this.$store.state.app.csrfToken
        axios
            .post(`${this.baseURL}/agent-body`, {
                name: this.agentName,
                body: this.code,
                _csrf: csrfToken,
            })
            .then(() => {
                this.loading = false
                this.updateAgentSuccessSnackbar = true
            })
            .catch((error) => {
                this.loading = false
                this.errorMessage = error.response.data.errorMessage
                this.updateAgentErrorSnackbar = true
            })
    }

    deleteAgent() {
        const csrfToken = this.$store.state.app.csrfToken
        axios
            .delete(`${this.baseURL}/agents/${this.agentName}`, {
                data: { _csrf: csrfToken },
            })
            .then(() => {
                this.$emit('refresh')
            })
            .catch((error) => {
                this.errorMessage = error.response.data.errorMessage
                this.deleteAgentErrorSnackbar = true
            })
    }

    showNameEditDialog() {
        this.fileNameEditDialog = true
    }

    hideNameEditDialog() {
        this.fileNameEditDialog = false
    }

    refreshAgents() {
        this.$emit('refresh')
    }
}
</script>

<style scoped>
.agent-file-name {
    height: 32px;
}
.code-editor-header {
    height: 48px;
}
.code-editor {
    flex-grow: 1;
    background-color: #fafafa;
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 5px 10px;
}
.v-btn.no-decoration {
    text-transform: none;
}
</style>

<style>
.prism-editor__textarea:focus {
    outline: none;
}
</style>
