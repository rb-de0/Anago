import fs from 'fs'
import { inject, injectable } from 'inversify'
import TYPES from 'config/types'
import DirectoryConfig from 'core/DirectoryConfig'
import APIError from 'error/APIError'
import AgentBody from 'models/common/AgentBody'
import AgentFile from 'models/common/AgentFile'
import PathUtil from 'utils/PathUtil'

@injectable()
export default class AgentFileRepository {
    private readonly directoryConfig: DirectoryConfig

    constructor(@inject(TYPES.DirectoryConfig) directoryConfig: DirectoryConfig) {
        this.directoryConfig = directoryConfig
    }

    async getAgentFiles(): Promise<AgentFile[]> {
        const files: AgentFile[] = await new Promise((resolve, reject) => {
            fs.readdir(this.directoryConfig.agent.root, { withFileTypes: true }, (error, files) => {
                if (error != null) {
                    reject(error)
                } else {
                    const sources = files
                        .filter((f) => {
                            return f.isFile()
                        })
                        .filter((f) => {
                            return AgentFile.isValidFile(f.name)
                        })
                        .map((f) => {
                            return new AgentFile(f.name)
                        })
                    resolve(sources)
                }
            })
        })
        return files
    }

    async getAgentBody(name: string): Promise<AgentBody> {
        const root = this.directoryConfig.agent.root
        const path = PathUtil.validPath(root, name)
        if (path == null) {
            throw new APIError(400, 'Invalid file path', null)
        }
        const body: AgentBody = await new Promise((resolve, reject) => {
            fs.readFile(path, (error, data) => {
                if (error != null) {
                    reject(error)
                } else {
                    const body = new AgentBody(data.toString())
                    resolve(body)
                }
            })
        })
        return body
    }

    async updateAgentBody(name: string, body: string): Promise<void> {
        const root = this.directoryConfig.agent.root
        const path = PathUtil.validPath(root, name)
        if (path == null) {
            throw new APIError(400, 'Invalid file path', null)
        }
        await new Promise((resolve, reject) => {
            fs.writeFile(path, body, (error) => {
                if (error != null) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }

    async createEmptyAgent(): Promise<void> {
        const fileName = Math.random().toString(32).substring(2)
        const root = this.directoryConfig.agent.root
        const path = root + '/' + `agent_${fileName}.ts`
        await new Promise((resolve, reject) => {
            fs.writeFile(path, '', { flag: 'wx' }, (error) => {
                if (error != null) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }

    async renameAgentFile(name: string, after: string) {
        const root = this.directoryConfig.agent.root
        const oldPath = PathUtil.validPath(root, name)
        if (oldPath == null) {
            throw new APIError(400, 'Invalid file path', null)
        }
        const newPath = PathUtil.validPath(root, after)
        if (newPath == null) {
            throw new APIError(400, 'Invalid file path', null)
        }
        await new Promise((resolve, reject) => {
            fs.rename(oldPath, newPath, (error) => {
                if (error != null) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }

    async deleteAgentFile(name: string) {
        const root = this.directoryConfig.agent.root
        const path = root + '/' + name
        await new Promise((resolve, reject) => {
            fs.unlink(path, (error) => {
                if (error != null) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }
}
