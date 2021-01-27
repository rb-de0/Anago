import { Transform } from 'class-transformer'

export default class CandleValueEntity {
    @Transform((value) => {
        return parseFloat(value)
    })
    h: number
    @Transform((value) => {
        return parseFloat(value)
    })
    l: number
    @Transform((value) => {
        return parseFloat(value)
    })
    o: number
    @Transform((value) => {
        return parseFloat(value)
    })
    c: number

    constructor(h: number, l: number, o: number, c: number) {
        this.h = h
        this.l = l
        this.o = o
        this.c = c
    }
}
