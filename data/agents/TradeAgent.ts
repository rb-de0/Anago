import * as model from 'Model'

export default class TestAgent extends model.Agent {
    name = 'TestAgent'
    description = 'TestAgent Description'

    async setup() {}

    async nextTick(tick: model.Tick) {
        console.log(tick)
    }
}
