<template>
    <div>
        <position-detail-view v-if="selectedPosition != null" :position="selectedPosition"></position-detail-view>
        <v-divider v-if="selectedPosition != null"></v-divider>
        <v-data-table
            dense
            :headers="headers"
            no-data-text="データがありません"
            :items="positionData"
            :custom-sort="customSort"
            :page.sync="page"
            :items-per-page="20"
            fixed-header
            hide-default-footer
            @page-count="pageCount = $event"
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
import { Component, Vue, Prop } from 'vue-property-decorator'
import moment from 'moment'
import PositionEntity from 'models/responses/PositionEntity'
import PositionTableData from 'models/viewdata/PositionTableData'
import PositionDetailView from 'views/PositonDetailView.vue'

@Component({
    components: {
        'position-detail-view': PositionDetailView,
    },
})
export default class BacktestDetailInfo extends Vue {
    @Prop(Array) readonly positions!: PositionEntity[]
    get positionData(): PositionTableData[] {
        return this.positions.map((p) => {
            return new PositionTableData(p)
        })
    }
    page = 1
    pageCount = 0
    selectedPosition: PositionTableData | null = null
    headers = [
        {
            text: '損益',
            value: 'profitOrLoss',
        },
        {
            text: '状態',
            value: 'status',
        },
        {
            text: '通貨ペア',
            value: 'instrument',
        },
        {
            text: '売/買',
            value: 'sellOrBuy',
        },
        {
            text: '数量',
            value: 'units',
        },
        {
            text: '購入価格',
            value: 'entryPrice',
        },
        {
            text: '決済価格',
            value: 'closePrice',
        },
        {
            text: '購入日時',
            value: 'entriedAt',
        },
        {
            text: '決済日時',
            value: 'closedAt',
        },
    ]

    selectPosition(position: PositionTableData) {
        if (position.id === this.selectedPosition?.id) {
            this.selectedPosition = null
            return
        }
        this.selectedPosition = position
    }

    customSort(items: PositionTableData[], index: string[], desc: boolean[]): PositionTableData[] {
        if (index.length === 0 || desc.length === 0) {
            return items
        }
        const isDesc = desc[0] === true
        const key = index[0]
        if (key === 'profitOrLoss') {
            return items.sort((a, b) => {
                return this.compareProfitOrLoss(a, b, isDesc)
            })
        }
        if (key === 'status') {
            return items.sort((a, b) => {
                return this.compareStatus(a, b, isDesc)
            })
        }
        if (key === 'instrument') {
            return items.sort((a, b) => {
                return this.compareInstrument(a, b, isDesc)
            })
        }
        if (key === 'sellOrBuy') {
            return items.sort((a, b) => {
                return this.compareSellOrBuy(a, b, isDesc)
            })
        }
        if (key === 'units') {
            return items.sort((a, b) => {
                return this.compareUnits(a, b, isDesc)
            })
        }
        if (key === 'entryPrice') {
            return items.sort((a, b) => {
                return this.compareEntryPrice(a, b, isDesc)
            })
        }
        if (key === 'closePrice') {
            return items.sort((a, b) => {
                return this.compareClosePrice(a, b, isDesc)
            })
        }
        if (key === 'entriedAt') {
            return items.sort((a, b) => {
                return this.compareEntryDate(a, b) * (isDesc ? 1 : -1)
            })
        }
        if (key === 'closedAt') {
            return items.sort((a, b) => {
                return this.compareCloseDate(a, b, isDesc)
            })
        }
        return items
    }

    private compareProfitOrLoss(a: PositionTableData, b: PositionTableData, desc: boolean): number {
        const order = desc === true ? 1 : -1
        if (a.profitOrLoss == null && b.profitOrLoss == null) {
            return this.compareEntryDate(a, b)
        }
        if (a.profitOrLoss == null && b.profitOrLoss != null) {
            return order
        }
        if (a.profitOrLoss != null && b.profitOrLoss == null) {
            return -order
        }
        if (a.profitOrLoss == null || b.profitOrLoss == null) {
            return 0
        }
        if (a.profitOrLoss == b.profitOrLoss) {
            return this.compareEntryDate(a, b)
        }
        return a.profitOrLoss > b.profitOrLoss ? -order : order
    }

    private compareStatus(a: PositionTableData, b: PositionTableData, desc: boolean): number {
        const order = desc === true ? 1 : -1
        if (a.status === b.status) {
            return this.compareEntryDate(a, b)
        }
        return a.status > b.status ? -order : order
    }

    private compareInstrument(a: PositionTableData, b: PositionTableData, desc: boolean): number {
        const order = desc === true ? 1 : -1
        if (a.instrument === b.instrument) {
            return this.compareEntryDate(a, b)
        }
        return a.instrument > b.instrument ? -order : order
    }

    private compareSellOrBuy(a: PositionTableData, b: PositionTableData, desc: boolean): number {
        const order = desc === true ? 1 : -1
        if (a.sellOrBuy === b.sellOrBuy) {
            return this.compareEntryDate(a, b)
        }
        return a.sellOrBuy > b.sellOrBuy ? -order : order
    }

    private compareUnits(a: PositionTableData, b: PositionTableData, desc: boolean): number {
        const order = desc === true ? 1 : -1
        if (a.units === b.units) {
            return this.compareEntryDate(a, b)
        }
        return a.units > b.units ? -order : order
    }

    private compareEntryPrice(a: PositionTableData, b: PositionTableData, desc: boolean): number {
        const order = desc === true ? 1 : -1
        if (a.entryPrice === b.entryPrice) {
            return this.compareEntryDate(a, b)
        }
        return a.entryPrice > b.entryPrice ? -order : order
    }

    private compareClosePrice(a: PositionTableData, b: PositionTableData, desc: boolean): number {
        const order = desc === true ? 1 : -1
        if (a.closePrice == null && b.closePrice == null) {
            return this.compareEntryDate(a, b)
        }
        if (a.closePrice == null && b.closePrice != null) {
            return order
        }
        if (a.closePrice != null && b.closePrice == null) {
            return -order
        }
        if (a.closePrice == null || b.closePrice == null) {
            return 0
        }
        if (a.closePrice == b.closePrice) {
            return this.compareEntryDate(a, b)
        }
        return a.closePrice > b.closePrice ? -order : order
    }

    private compareCloseDate(a: PositionTableData, b: PositionTableData, desc: boolean): number {
        const order = desc === true ? 1 : -1
        if (a.closedAt == null && b.closedAt == null) {
            return this.compareEntryDate(a, b)
        }
        if (a.closedAt == null && b.closedAt != null) {
            return order
        }
        if (a.closedAt != null && b.closedAt == null) {
            return -order
        }
        if (a.closedAt == null || b.closedAt == null) {
            return 0
        }
        if (a.closedAt == b.closedAt) {
            return this.compareEntryDate(a, b)
        }
        return moment(a.closedAt).isAfter(moment(b.closedAt)) ? -order : order
    }

    private compareEntryDate(a: PositionTableData, b: PositionTableData): number {
        return moment(a.entriedAt).isAfter(moment(b.entriedAt)) ? -1 : 1
    }
}
</script>

<style scoped>
.position-detail {
    font-size: 14px;
}
</style>
