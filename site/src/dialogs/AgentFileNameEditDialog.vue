<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
            <v-card-title>
                <span class="headline">エージェントファイル名変更</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" xs="12">
                            <v-text-field label="ファイル名" v-model="newName" required></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="hideThis">キャンセル</v-btn>
                <v-btn color="blue darken-1" text :loading="loading" @click="update">変更</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Prop, Watch } from 'vue-property-decorator'
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import Config from 'mixins/Config'

@Component
export default class AgentFileNameEditDialog extends Mixins<Config>(Config) {
    @Prop(Boolean) readonly dialog!: boolean
    @Prop(String) readonly name!: string
    newName: string = ''
    loading: boolean = false
    renameAgentErrorSnackbar: boolean = false

    @Watch('dialog')
    onDialogChanged() {
        this.newName = this.name
    }

    update() {
        this.loading = true
        const csrfToken = this.$store.state.app.csrfToken
        axios
            .put(`${this.baseURL}/agents/rename`, {
                name: this.name,
                newName: this.newName,
                _csrf: csrfToken,
            })
            .then(() => {
                this.$emit('refresh')
                this.hideThis()
            })
            .catch(() => {
                this.renameAgentErrorSnackbar = true
                this.loading = false
            })
            .then(() => {
                this.loading = false
            })
    }

    private hideThis() {
        this.$emit('hide')
    }
}
</script>
