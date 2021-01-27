<template>
    <v-dialog v-model="dialog" persistent width="290px">
        <v-date-picker v-model="currentDate" scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="hideThis">キャンセル</v-btn>
            <v-btn text color="primary" @click="apply">OK</v-btn>
        </v-date-picker>
    </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class DatePickerDialog extends Vue {
    @Prop(Boolean) readonly dialog!: boolean
    @Prop(String) readonly date!: string
    currentDate = new Date().toISOString().substr(0, 10)

    @Watch('dialog')
    onChildChanged(dialog: boolean) {
        if (dialog === true) {
            this.currentDate = this.date
        }
    }

    hideThis() {
        this.$emit('hide')
    }

    apply() {
        this.$emit('apply', this.currentDate)
    }
}
</script>
