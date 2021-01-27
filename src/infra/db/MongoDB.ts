import mongoose from 'mongoose'

export default class MongoDB {
    async createConnection() {
        mongoose.set('useCreateIndex', true)
        try {
            await mongoose.connect('mongodb://0.0.0.0:27018/anago', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            })
        } catch {
            await mongoose.connect('mongodb://mongo/anago', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            })
        }
    }

    async releaseConnection() {
        await mongoose.disconnect()
    }
}
