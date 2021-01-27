import { inject, injectable } from 'inversify'
import ts from 'typescript'
import TYPES from 'config/types'
import DirectoryConfig from 'core/DirectoryConfig'
import AgentCompiler from 'models/trading/core/AgentCompiler'

/**
 * TypeScriptのCompilerAPIを利用してエージェントをコンパイルする
 */
@injectable()
export default class DefaultAgentCompiler implements AgentCompiler {
    private readonly directoryConfig: DirectoryConfig

    constructor(@inject(TYPES.DirectoryConfig) directoryConfig: DirectoryConfig) {
        this.directoryConfig = directoryConfig
    }

    async compile(agentFilePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // コンパイラオプション
            const options = ts.getDefaultCompilerOptions()
            options.baseUrl = this.directoryConfig.project.baseUrl
            options.paths = { Model: [this.directoryConfig.agent.modelPath], 'Root/*': [this.directoryConfig.agent.root + '/*'] }
            options.module = ts.ModuleKind.CommonJS
            options.moduleResolution = ts.ModuleResolutionKind.NodeJs
            options.emitDecoratorMetadata = true
            options.experimentalDecorators = true
            options.esModuleInterop = true
            // ホスト
            const outputText = ''
            const compilerHost = ts.createCompilerHost(options)
            compilerHost.writeFile = (fileName, text) => {
                const fileNameExtensionRemoved = fileName.split('.')[0]
                const agentPathExtensionRemoved = agentFilePath.split('.')[0]
                if (fileNameExtensionRemoved === agentPathExtensionRemoved) {
                    resolve(text)
                }
            }
            // コンパイル
            const program = ts.createProgram([agentFilePath], options, compilerHost)
            const diagostics = ts.getPreEmitDiagnostics(program)
            if (diagostics.length > 0) {
                const diagosticsMessage = diagostics
                    .map((e) => {
                        return ts.flattenDiagnosticMessageText(e.messageText, '\n')
                    })
                    .join('\n')
                reject(diagosticsMessage)
            }
            program.emit()
            if (outputText.length === 0) {
                reject('エージェントのコンパイルに失敗しました')
            }
        })
    }
}
