<template>
    <div class="white">
        <position-detail-view v-if="selectedPosition != null" :position="selectedPosition"></position-detail-view>
        <v-divider v-if="selectedPosition != null"></v-divider>
        <v-data-table
            dense
            :headers="headers"
            :items="positionData"
            :page.sync="tablePage"
            :items-per-page="pagePerPage"
            no-data-text="データがありません"
            fixed-header
            hide-default-footer
            height="600px"
        >
            <template slot="item" slot-scope="props">
                <tr @click="selectPosition(props.item)" :class="{ 'grey lighten-3': selectedPosition != null ? props.item.id === selectedPosition.id : false }">
                    <td :class="{ 'teal--text': props.item.profitOrLoss >= 0, 'red--text': props.item.profitOrLoss < 0 }">{{ props.item.profitOrLoss }}</td>
                    <td :class="{ 'teal--text': props.item.status === '決済済み', 'red--text': props.item.status === '未決済' }">{{ props.item.status }}</td>
                    <td>{{ props.item.instrument }}</td>
                    <td>{{ props.item.sellOrBuy }}</td>
                    <td>{{ props.item.units }}</td>
                    <td>{{ props.item.entryPrice }}</td>
                    <td>{{ props.item.closePrice }}</td>
                    <td>{{ props.item.entriedAt }}</td>
                    <td>{{ props.item.closedAt }}</td>
                </tr>
            </template>
        </v-data-table>
        <div class="text-center pt-2">
            <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
    </div>
</template>

<script lang="ts">
import { Watch } from 'vue-property-decorator'
import { Component, Mixins } from 'vue-mixin-decorator'
import axios from 'axios'
import { plainToClass } from 'class-transformer'
import Config from 'mixins/Config'
import PositionEntity from 'models/responses/PositionEntity'
import PositionTableData from 'models/viewdata/PositionTableData'
import PositionDetailView from 'views/PositonDetailView.vue'

@Component({
    components: {
        'position-detail-view': PositionDetailView,
    },
})
export default class RealTradePositionList extends Mixins<Config>(Config) {
    positions: PositionEntity[] = []
    get positionData(): PositionTableData[] {
        return this.positions.map((p) => {
            return new PositionTableData(p)
        })
    }
    pagePerPage = 20
    page = 1
    pageCount = 0
    tablePage = 1
    selectedPosition: PositionTableData | null = null
    headers = [
        {
            text: '損益',
            sortable: false,
            value: 'profitOrLoss',
        },
        {
            text: '状態',
            sortable: false,
            value: 'status',
        },
        {
            text: '通貨ペア',
            sortable: false,
            value: 'instrument',
        },
        {
            text: '売/買',
            sortable: false,
            value: 'sellOrBuy',
        },
        {
            text: '数量',
            sortable: false,
            value: 'units',
        },
        {
            text: '購入価格',
            sortable: false,
            value: 'entryPrice',
        },
        {
            text: '決済価格',
            sortable: false,
            value: 'closePrice',
        },
        {
            text: '購入日時',
            sortable: false,
            value: 'entriedAt',
        },
        {
            text: '決済日時',
            sortable: false,
            value: 'closedAt',
        },
    ]

    @Watch('page', { immediate: false })
    routeChanged() {
        if (this.positions.length > (this.page - 1) * this.pagePerPage) {
            this.tablePage = this.page
        } else {
            this.loadNextPage()
        }
    }

    mounted() {
        this.refresh()
    }

    refresh() {
        axios
            .get(`${this.baseURL}/positions`)
            .then((response) => {
                const positions = plainToClass(PositionEntity, response.data)
                this.pageCount = this.page + (positions.length > this.pagePerPage ? 1 : 0)
                this.positions = positions.slice(0, this.pagePerPage)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    private loadNextPage() {
        const lastId = this.positions[this.positions.length - 1].id
        axios
            .get(`${this.baseURL}/positions`, {
                params: {
                    lastId: lastId,
                },
            })
            .then((response) => {
                const positions = plainToClass(PositionEntity, response.data)
                this.pageCount = this.page + (positions.length > 20 ? 1 : 0)
                this.positions = this.positions.concat(positions.slice(0, 20))
                this.tablePage = this.page
            })
    }

    selectPosition(position: PositionTableData) {
        if (position.id === this.selectedPosition?.id) {
            this.selectedPosition = null
            return
        }
        this.selectedPosition = position
    }
}
</script>

<style scoped></style>
