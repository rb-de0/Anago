// Meta
import 'reflect-metadata'
import 'es6-shim'

// Vue
import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Vuetify, { VListItem } from 'vuetify/lib'
import VueApexCharts from 'vue-apexcharts'

// Components
import axios from 'axios'
import Root from 'pages/Root.vue'
import Main from 'pages/Main.vue'
import RealTrade from 'pages/RealTrade.vue'
import Backtest from 'pages/Backtest.vue'
import BacktestDetail from 'pages/BacktestDetail.vue'
import Agent from 'pages/Agent.vue'
import AgentDetail from 'pages/AgentDetail.vue'
import RealTradeSetting from 'pages/RealTrade/RealTradeSetting.vue'
import RealTradeInstrumentSetting from 'pages/RealTrade/RealTradeInstrumentSetting.vue'
import RealTradePositionList from 'pages/RealTrade/RealTradePositionList.vue'
import RealTradeLog from 'pages/RealTrade/RealTradeLog.vue'
import RealTradeStatus from 'pages/RealTrade/RealTradeStatus.vue'
import RealTradeChart from 'pages/RealTrade/RealTradeChart.vue'
import Login from 'pages/Login.vue'
import AgentDocument from 'pages/AgentDocument.vue'

// Networking

// Styles
import 'material-design-icons-iconfont/dist/material-design-icons.css'

// State
import app from 'state/AppState'

// Setup Vue
Vue.use(Vuetify, {
    components: { VListItem },
})
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(VueApexCharts)

const parseBacktest = (route: any) => {
    const backtestId = route.params.backtestId
    return { backtestId: backtestId }
}

const parseAgent = (route: any) => {
    const agentName = route.params.agentName
    return { agentName: agentName }
}

// Setup Routes
const routes = [
    {
        path: '/',
        component: Main,
        children: [
            {
                path: 'trades',
                component: RealTrade,
                children: [
                    {
                        path: 'rate',
                        component: RealTradeChart,
                    },
                    {
                        path: 'status',
                        component: RealTradeStatus,
                    },
                    {
                        path: 'settings',
                        component: RealTradeSetting,
                    },
                    {
                        path: 'instruments',
                        component: RealTradeInstrumentSetting,
                    },
                    {
                        path: 'positions',
                        component: RealTradePositionList,
                    },
                    {
                        path: 'logs',
                        component: RealTradeLog,
                    },
                ],
            },
            {
                path: 'backtests',
                component: Backtest,
                children: [
                    {
                        path: ':backtestId',
                        component: BacktestDetail,
                        props: parseBacktest,
                    },
                ],
            },
            {
                path: 'agents',
                component: Agent,
                children: [
                    {
                        path: ':agentName',
                        component: AgentDetail,
                        props: parseAgent,
                    },
                ],
            },
            {
                path: 'docs',
                component: AgentDocument,
            },
        ],
    },
    {
        path: '/login',
        component: Login,
    },
    {
        path: '*',
        component: Main,
    },
]

const router = new VueRouter({
    routes,
    mode: 'history',
})

// Setup Store
const store = new Vuex.Store({
    state: {},
    modules: {
        app,
    },
})

// Setup axios
axios.defaults.withCredentials = true
axios.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        const isLoginForm = error.response.config.url.includes('login')
        if (!isLoginForm && (error.response.status === 401 || error.response.status === 403)) {
            router.replace('/login').catch(() => {})
        }
        throw error
    }
)

// vuetify
const vuetify = new Vuetify({
    icons: {
        iconfont: 'md',
    },
})

new Vue({
    el: '#app',
    store,
    router,
    vuetify,
    render: (h) => h(Root),
})
