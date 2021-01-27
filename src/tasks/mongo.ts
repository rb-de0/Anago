import bcrypt from 'bcrypt'
import User, { OandaAPIType } from 'models/common/User'
import { UserModel } from 'infra/db/schema/UserSchema'
import MongoDB from 'infra/db/MongoDB'
import Logger from 'utils/Logger'

if (process.argv.length < 6) {
    Logger.error('missing argument')
    process.exit(1)
}
const username = process.argv[2]
const password = process.argv[3]
const apiKey = process.argv[4]
const type = process.argv[5]
const apiType: OandaAPIType = type == 'Real' ? 'Real' : 'Practice'

const main = async () => {
    try {
        const mongoDB = new MongoDB()
        await mongoDB.createConnection()
        const users = await UserModel.find().exec()
        if (users.length > 0) {
            await UserModel.deleteMany({}).exec()
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User(username, hashedPassword, apiKey, apiType, null)
        await new UserModel(user).save()
        await mongoDB.releaseConnection()
    } catch (err) {
        Logger.error(err)
    }
}

main()
