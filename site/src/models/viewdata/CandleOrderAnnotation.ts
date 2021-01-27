export default class CandleOrderAnnotation {
    x: number
    borderColor: string
    label: CandleOrderAnnotationLabel

    constructor(date: Date, sellOrBuy: string, entry: boolean, profitOrLoss: number | null, price: number) {
        this.x = date.getTime()
        const sellOrBuyMessage = sellOrBuy == 'Sell' ? '売' : '買'
        if (entry === true) {
            this.borderColor = '#0000ff'
            const text = `Opened ${sellOrBuyMessage} ${price}`
            this.label = new CandleOrderAnnotationLabel(this.borderColor, 'vertical', text)
        } else {
            if (profitOrLoss == null) {
                this.borderColor = '#00ff00'
                const text = `Closed ${sellOrBuyMessage} ${price}`
                this.label = new CandleOrderAnnotationLabel(this.borderColor, 'vertical', text)
            } else {
                this.borderColor = profitOrLoss > 0 ? '#00ff00' : '#ff0000'
                const text = `Closed ${sellOrBuyMessage} ${price} profit: ${Math.floor(profitOrLoss * 1000) / 1000}`
                this.label = new CandleOrderAnnotationLabel(this.borderColor, 'vertical', text)
            }
        }
    }
}

export class CandleOrderAnnotationLabel {
    borderColor: string
    orientation: string
    text: string

    constructor(borderColor: string, orientation: string, text: string) {
        this.borderColor = borderColor
        this.orientation = orientation
        this.text = text
    }
}
