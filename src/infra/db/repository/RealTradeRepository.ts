import { plainToClass } from 'class-transformer'
import RealTradeSetting from 'models/trading/core/RealTradeSetting'
import { RealTradeSettingModel } from 'infra/db/schema/RealTradeSettingSchema'

export default class RealTradeRepository {
    async loadRealTradeSettings(): Promise<RealTradeSetting[]> {
        const settings = await RealTradeSettingModel.find()
            .lean<RealTradeSetting>()
            .exec()
            .then((r) => {
                return plainToClass(RealTradeSetting, r as RealTradeSetting[])
            })
        return settings
    }

    async replaceRealTradeSetting(settings: RealTradeSetting[]) {
        await RealTradeSettingModel.deleteMany({}).exec()
        for (const setting of settings) {
            await new RealTradeSettingModel(setting).save()
        }
    }
}
