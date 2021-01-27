export default class StringUtil {
    static randomString(): string {
        return Math.random().toString(32).substring(2)
    }
}
