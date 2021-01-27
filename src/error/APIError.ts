import { ErrorType } from 'error/ErrorType'

export default class APIError extends Error {
    type: ErrorType = 'APIError'
    statusCode: number
    errorMessage: string
    errorObject: any

    constructor(statusCode: number, errorMessage: string, errorObject: any) {
        super(errorMessage)
        this.statusCode = statusCode
        this.errorMessage = errorMessage
        this.errorObject = errorObject
    }
}
