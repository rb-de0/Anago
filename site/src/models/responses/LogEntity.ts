import moment from 'moment'
import { Type } from 'class-transformer'

export default class LogEntity {
    readonly _id: string
    readonly message: string
    readonly level: string
    @Type(() => Date)
    readonly timestamp: Date

    constructor(_id: string, message: string, level: string, timestamp: Date) {
        this._id = _id
        this.message = message
        this.level = level
        this.timestamp = timestamp
    }

    get messageText(): string {
        let prefix = ''
        switch (this.level) {
            case 'info':
                prefix = '[INFO]'
                break
            case 'debug':
                prefix = '[DEBUG]'
                break
            case 'error':
                prefix = '[ERROR]'
                break
        }
        const timestamp = moment(this.timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')
        return prefix + ': ' + this.message + ` [${timestamp}]`
    }
}
