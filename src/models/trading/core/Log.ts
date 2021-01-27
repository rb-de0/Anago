import { LogDocument } from 'infra/db/schema/LogSchema'

export default class Log implements LogDocument {
    timestamp: Date
    message: string
    level: LogLevel

    constructor(message: string, level: LogLevel) {
        this.timestamp = new Date()
        this.message = message
        this.level = level
    }
}

export type LogLevel = 'info' | 'debug' | 'error'
