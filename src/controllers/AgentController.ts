import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import APIError from 'error/APIError'
import AgentFileRepository from 'infra/file/AgentFileRepository'
import AgentCompiler from 'models/trading/core/AgentCompiler'
import DirectoryConfig from 'core/DirectoryConfig'
import PathUtil from 'utils/PathUtil'

export default class AgentController {
    async getAgents(_request: Request, response: Response): Promise<void> {
        const repository = container.get<AgentFileRepository>(TYPES.AgentFileRepository)
        const files = await repository.getAgentFiles()
        response.json(files)
    }

    async getAgentBody(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            throw new APIError(400, 'request parameter error', errors.array())
        }
        const name = request.query.name as string
        const repository = container.get<AgentFileRepository>(TYPES.AgentFileRepository)
        const body = await repository.getAgentBody(name)
        response.json(body)
    }

    async updateAgentBody(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            throw new APIError(400, 'request parameter error', errors.array())
        }
        const repository = container.get<AgentFileRepository>(TYPES.AgentFileRepository)
        await repository.updateAgentBody(request.body.name, request.body.body)
        // check compile
        const directoryConfig = container.get<DirectoryConfig>(TYPES.DirectoryConfig)
        const compiler = container.get<AgentCompiler>(TYPES.AgentCompiler)
        const root = directoryConfig.agent.root
        const path = PathUtil.validPath(root, request.body.name)
        if (path == null) {
            throw new APIError(400, 'Invalid file path', null)
        }
        await compiler.compile(path).catch((error) => {
            throw new APIError(400, error, null)
        })
        response.json({})
    }

    async createNewAgent(_request: Request, response: Response): Promise<void> {
        const repository = container.get<AgentFileRepository>(TYPES.AgentFileRepository)
        await repository.createEmptyAgent()
        response.json({})
    }

    async renameAgentName(request: Request, response: Response): Promise<void> {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            throw new APIError(400, 'request parameter error', errors.array())
        }
        const repository = container.get<AgentFileRepository>(TYPES.AgentFileRepository)
        await repository.renameAgentFile(request.body.name, request.body.newName)
        response.json({})
    }

    async deleteAgent(request: Request, response: Response): Promise<void> {
        const repository = container.get<AgentFileRepository>(TYPES.AgentFileRepository)
        await repository.deleteAgentFile(request.params.name)
        response.json({})
    }
}
