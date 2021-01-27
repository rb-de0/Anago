import path from 'path'

export default class PathUtil {
    static getProjectRoot(): string {
        const root = __dirname.split('src')[0]
        return root.substring(0, root.length - 1)
    }

    static validPath(root: string, userSupplied: string): string | null {
        const joined = path.join(root, userSupplied)
        if (joined.indexOf(root) !== 0) {
            return null
        }
        return joined
    }
}
