import childProcess, { ChildProcess } from 'child_process'
import { inject, injectable } from 'inversify'
import TYPES from 'config/types'
import DirectoryConfig from 'core/DirectoryConfig'
import Log from 'models/trading/core/Log'
import Logger from 'utils/Logger'
import LogRepository from 'infra/db/repository/LogRepository'

@injectable()
export default class RealTradeProcessLauncher {
    private readonly directoryConfig: DirectoryConfig
    private readonly repository: LogRepository
    private process: ChildProcess | null = null

    constructor(@inject(TYPES.DirectoryConfig) directoryConfig: DirectoryConfig) {
        this.directoryConfig = directoryConfig
        this.repository = new LogRepository()
    }

    launch() {
        if (this.process != null) {
            this.process.kill()
            this.process.removeAllListeners()
        }
        const process = childProcess.fork(this.directoryConfig.subprocess.realtrade)
        this.setChildEventListener(process)
        this.process = process
    }

    isRunning() {
        return this.process != null && this.process.exitCode != null
    }

    private setChildEventListener(process: ChildProcess) {
        process.on('message', async (message) => {
            if (typeof message === 'string') {
                await this.repository.storeLog(new Log(message, 'error'))
            }
            Logger.error(message)
        })
        process.on('close', async (code) => {
            Logger.debug(`child process close, exit code: ${code}`)
        })
        process.on('exit', async (code) => {
            Logger.debug(`child process exit, exit code: ${code}`)
        })
    }
}
