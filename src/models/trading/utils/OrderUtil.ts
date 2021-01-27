export default class OrderUtil {
    static convertToOanda(type: string): string {
        switch (type) {
            case 'market':
                return 'MARKET'
            case 'limit':
                return 'LIMIT'
            case 'stop':
                return 'STOP'
            case 'marketIfTouched':
                return 'MARKET_IF_TOUCHED'
            default:
                return 'MARKET'
        }
    }
}
