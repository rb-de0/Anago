export default class ThreadUtil {
    static sleep(interval: number) {
        this.msleep(interval * 1000)
    }

    static msleep(interval: number) {
        const buffer = new SharedArrayBuffer(4)
        Atomics.wait(new Int32Array(buffer), 0, 0, interval)
    }
}
