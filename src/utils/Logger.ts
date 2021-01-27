import log4js from 'log4js'
const logger = log4js.getLogger()
logger.level = 'trace'

export default class Logger {
    static debug(message: any) {
        logger.debug(message)
    }

    static error(message: any) {
        logger.error(message)
    }
}
