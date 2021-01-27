import { plainToClass } from 'class-transformer'
import InstrumentSetting from 'models/trading/core/InstrumentSetting'
import { InstrumentSettingModel } from 'infra/db/schema/InstrumentSettingSchema'

export default class InstrumentSettingRepository {
    async loadSettings(): Promise<InstrumentSetting[]> {
        const settings = await InstrumentSettingModel.find()
            .lean<InstrumentSetting>()
            .exec()
            .then((r) => {
                return plainToClass(InstrumentSetting, r as InstrumentSetting[])
            })
        return settings
    }

    async replaceSettings(settings: InstrumentSetting[]) {
        await InstrumentSettingModel.deleteMany({}).exec()
        for (const setting of settings) {
            await new InstrumentSettingModel(setting).save()
        }
    }
}
