/**
 * GlobalStore is a trivial storage that resembles a Map to be used from Browser contexts
 * to retain data through page navigations and browser instances. It limits Map's functionality
 * because it's currently impossible for functions and object references to cross Node-Browser threshold.
 */
export class GlobalStore<V> extends Map<string, V> {
    override get(key: string) {
        if (typeof key !== 'string') throw new Error('GlobalStore#get parameter "key" must be a string.');
        return super.get(key);
    }

    override set(key: string, value: V) {
        if (typeof key !== 'string') throw new Error('GlobalStore#set parameter "key" must be a string.');
        return super.set(key, value);
    }

    override forEach(): never {
        throw new Error('GlobalStore#forEach function is not available due to underlying technology limitations.');
    }

    override values() {
        return Array.from(super.values()) as any;
    }

    override keys() {
        return Array.from(super.keys()) as any;
    }

    override entries() {
        return Array.from(super.entries()) as any;
    }
}
