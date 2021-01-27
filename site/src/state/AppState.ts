import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import config from 'APIConfig'
import axios from 'axios'
import { plainToClass } from 'class-transformer'
import AgentFileEntity from 'models/responses/AgentFileEntity'
import InstrumentsEntity from 'models/responses/InstrumentsEntity'
import CSRFTokenEntity from 'models/responses/CSRFTokenEntity'

@Module
export default class AppState extends VuexModule {
    pageName: string = ''
    agents: AgentFileEntity[] = []
    instruments: string[] = []
    csrfToken: string = ''

    @Mutation
    updatePageName(pageName: string) {
        this.pageName = pageName
    }

    @Mutation
    updateAgents(agents: AgentFileEntity[]) {
        this.agents = agents
    }

    @Mutation
    updateInstruments(instruments: string[]) {
        this.instruments = instruments
    }

    @Mutation
    updateCSRFToken(token: string) {
        this.csrfToken = token
    }

    @Action
    refreshAgents() {
        axios
            .get(`${config.baseURL}/agents`)
            .then((response) => {
                const agents = plainToClass(AgentFileEntity, response.data)
                this.context.commit('updateAgents', agents)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    @Action
    refreshInstruments() {
        axios
            .get(`${config.baseURL}/instruments`)
            .then((response) => {
                const instrumentList = plainToClass(InstrumentsEntity, response.data as InstrumentsEntity)
                const instruments = instrumentList.instruments.map((i) => {
                    return i.name
                })
                this.context.commit('updateInstruments', instruments)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    @Action
    refresCSRFToken() {
        axios
            .get(`${config.baseURL}/csrfToken`)
            .then((response) => {
                const token = plainToClass(CSRFTokenEntity, response.data as CSRFTokenEntity)
                this.context.commit('updateCSRFToken', token.csrfToken)
            })
            .catch((error) => {
                console.log(error)
            })
    }
}
