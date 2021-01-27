<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import Chart from 'chart.js'
import { Doughnut, mixins } from 'vue-chartjs'

@Component
export default class DoughnutGraphView extends Mixins(Doughnut, mixins.reactiveProp) {
    @Prop() chartData!: Chart.ChartData
    @Prop() options!: Chart.ChartOptions

    mounted() {
        this.renderChart(this.chartData, this.options)
    }
}
</script>
