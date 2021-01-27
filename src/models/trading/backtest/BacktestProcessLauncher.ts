import childProcess, { ChildProcess } from 'child_process'
import { inject, injectable } from 'inversify'
import TYPES from 'config/types'
import DirectoryConfig from 'core/DirectoryConfig'
import BacktestRepository from 'infra/db/repository/BacktestRepository'
import Log from 'models/trading/core/Log'
import Logger from 'utils/Logger'

@injectable()
export default class BacktestProcessLauncher {
    private readonly directoryConfig: DirectoryConfig
    private readonly repository: BacktestRepository

    constructor(@inject(TYPES.DirectoryConfig) directoryConfig: DirectoryConfig) {
        this.directoryConfig = directoryConfig
        this.repository = new BacktestRepository()
    }

    launch(id: string) {
        const process = childProcess.fork(this.directoryConfig.subprocess.backtest, [id])
        this.setChildEventListener(process, id)
    }

    private setChildEventListener(process: ChildProcess, id: string) {
        process.on('message', async (message) => {
            if (typeof message === 'string') {
                await this.repository.pushLog(id, new Log(message, 'error'))
            }
            Logger.error(message)
        })
        process.on('exit', async (code) => {
            if (code === 0) {
                Logger.debug(`child process exit code: ${code}`)
                await this.repository.updateStatus(id, 'Finished')
            } else {
                Logger.error(`child process exit code: ${code}`)
                await this.repository.updateStatus(id, 'FinishWithError')
            }
        })
    }
}
