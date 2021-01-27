<template>
    <v-container fluid fill-height class="align-content-start">
        <div class="api-reference grey--text text--darken-3">
            <div class="text-h5 font-weight-bold mb-6">APIリファレンス</div>
            <div class="mb-12">
                <div class="text-h6 font-weight-bold mb-4">エージェントの基本構成</div>
                <div>
                    <div class="code-editor">
                        <code-editor v-model="sampleAgentCode" :highlight="highlighter" readonly></code-editor>
                    </div>
                </div>
            </div>
            <div class="mb-6">
                <div class="text-h6 font-weight-bold mb-4">API一覧</div>
                <template v-for="model in models">
                    <div :key="model.name" class="ml-3 mb-2">
                        <a :href="anchorLink(model.name)">- {{ model.name }}</a>
                    </div>
                </template>
            </div>
            <div>
                <template v-for="model in models">
                    <div :id="model.name" class="model-link" :key="model.name">
                        <div class="text-h6 font-weight-bold mb-4">
                            <a :href="anchorLink(model.name)">{{ model.name }}</a>
                        </div>
                        <div v-if="model.properties != null" class="mb-8">
                            <div class="subtitle-1 mb-2">プロパティ</div>
                            <v-simple-table>
                                <template #default>
                                    <thead>
                                        <tr>
                                            <th class="text-left">名前</th>
                                            <th class="text-left">説明</th>
                                            <th class="text-left">型</th>
                                            <th class="text-left">readonly</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in model.properties" :key="item.name">
                                            <td>{{ item.name }}</td>
                                            <td>{{ item.description }}</td>
                                            <td>
                                                <div v-if="item.type.isAnagoModel !== true">{{ typeName(item.type) }}</div>
                                                <a v-if="item.type.isAnagoModel === true" :href="anchorLink(item.type.name)">{{ typeName(item.type) }}</a>
                                            </td>
                                            <td>
                                                <div v-if="item.readonly === true">○</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </template>
                            </v-simple-table>
                        </div>
                        <div v-if="model.functions != null" class="mb-8">
                            <div class="subtitle-1 mb-2">関数</div>
                            <v-simple-table>
                                <template #default>
                                    <thead>
                                        <tr>
                                            <th class="text-left">名前</th>
                                            <th class="text-left">説明</th>
                                            <th class="text-left">引数</th>
                                            <th class="text-left">返り値</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in model.functions" :key="item.name">
                                            <td>{{ item.name }}</td>
                                            <td>{{ item.description }}</td>
                                            <td>
                                                <template v-for="param in item.parameters">
                                                    <div :key="param.name" class="my-2">
                                                        <div class="mb-1">{{ param.name }}</div>
                                                        <div class="mb-1">説明: {{ param.description }}</div>
                                                        <div>
                                                            型:
                                                            <span v-if="param.type.isAnagoModel !== true">{{ typeName(param.type) }}</span>
                                                            <a v-if="param.type.isAnagoModel === true" :href="anchorLink(param.type.name)">{{ typeName(param.type) }}</a>
                                                        </div>
                                                    </div>
                                                </template>
                                            </td>
                                            <td>
                                                <div v-if="item.returnType.isAnagoModel !== true">{{ typeName(item.returnType) }}</div>
                                                <a v-if="item.returnType.isAnagoModel === true" :href="anchorLink(item.returnType.name)">{{ typeName(item.returnType) }}</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </template>
                            </v-simple-table>
                        </div>
                        <div v-if="model.cases != null" class="mb-8">
                            <div class="subtitle-1 mb-2">
                                Enum 型:
                                <span v-if="model.type.isAnagoModel !== true">{{ typeName(model.type) }}</span>
                                <a v-if="model.type.isAnagoModel === true" :href="anchorLink(model.type.name)">{{ typeName(model.type) }}</a>
                            </div>
                            <v-simple-table>
                                <template #default>
                                    <thead>
                                        <tr>
                                            <th class="text-left">名前</th>
                                            <th class="text-left">説明</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in model.cases" :key="item.name">
                                            <td>{{ item.name }}</td>
                                            <td>{{ item.description }}</td>
                                        </tr>
                                    </tbody>
                                </template>
                            </v-simple-table>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css'
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/themes/prism-coy.css'

const modelDefinitions = require('resources/models.json')
const code = `import * as model from 'Model'

export default class SampleAgent extends model.Agent {
    name = 'AgentName' // エージェントの名前
    description = 'Agent Description' // エージェントの説明

    async setup() {
        // エージェントの初期設定をする
        // ex. グラフの初期化
    }
    
    async nextTick(tick: model.Tick) {
       // ティック取得ごとの処理を書く
    }
}`

@Component({
    components: {
        'code-editor': PrismEditor,
    },
})
export default class AgentDocument extends Vue {
    highlighter(code: any) {
        return highlight(code, languages.ts)
    }

    anchorLink(text: string): string {
        return `#${text}`
    }

    typeName(type: any): string {
        let typeName = type.name
        if (type.optional === true) {
            typeName = `${typeName} | null`
        }
        if (type.isArray === true) {
            typeName = `${typeName}[]`
        }
        if (type.isPromise === true) {
            return `Promise<${typeName}>`
        }
        return typeName
    }

    models = modelDefinitions
    sampleAgentCode = code
}
</script>

<style scoped>
.code-editor {
    background-color: #fafafa;
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 16px 16px;
}
.api-reference a {
    color: #424242;
    text-decoration: none;
}
.model-link {
    padding-top: 100px;
    margin-top: -100px;
}
</style>

<style>
.prism-editor__textarea:focus {
    outline: none;
}
</style>
