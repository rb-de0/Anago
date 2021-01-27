export default class ColorUtil {
    static colorFrom(text: string): string {
        let hash = 0
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash)
        }
        const code = (hash & 0x00ffffff).toString(16).toUpperCase()
        return '#' + '00000'.substring(0, 6 - code.length) + code
    }
}
