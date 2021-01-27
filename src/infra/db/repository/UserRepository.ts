import { plainToClass } from 'class-transformer'
import User from 'models/common/User'
import { UserModel } from 'infra/db/schema/UserSchema'

export default class UserRepository {
    async loadUsers(): Promise<User[]> {
        const users = await UserModel.find()
            .lean<User>()
            .exec()
            .then((r) => {
                return plainToClass(User, r as User[])
            })
        return users
    }

    async loadUser(id: string): Promise<User> {
        const user = await UserModel.findById(id)
            .lean<User>()
            .exec()
            .then((r) => {
                return plainToClass(User, r as User)
            })
        return user
    }

    async updateSelectedInstrument(user: User, instrument: string): Promise<void> {
        await UserModel.findByIdAndUpdate(user._id, {
            lastSelectedInstrument: instrument,
        })
    }
}
