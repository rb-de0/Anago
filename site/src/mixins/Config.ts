import Vue from 'vue'
import config from 'APIConfig'
import { Mixin } from 'vue-mixin-decorator'

@Mixin
export default class ConfigMixin extends Vue {
    baseURL: string = config.baseURL
}
