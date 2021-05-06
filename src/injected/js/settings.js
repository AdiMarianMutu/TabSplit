class Settings {
    #crmStorage;
    #crmRuntime;
    #sLoaded;

    constructor() {
        this.#crmStorage = chrome.storage.sync;
        this.#crmRuntime = chrome.runtime;
        this.#sLoaded = {};
    }

    async #_get(key, onUndefined = null) {
        let v;
        let _t = this;
        v = await new Promise(function(resolve, reject, t = _t) {
            t.#crmStorage.get([key], (value) => {
                resolve(value[key]);
            })
        });
        
        v = v === undefined ? onUndefined : v;
        return v;
    }

    async loadFromStorage(keys) {
        let tmp = {};

        for(let k in keys)
            tmp[k] = await this.#_get(k, keys[k]);

        this.#sLoaded = tmp;
    }

    async reloadCurrentKeysFromStorage() {
        return await this.loadFromStorage(this.#sLoaded);
    }

    save(values) {
        for (let k in values) {
            this.#crmStorage.set({ k: values[k]});

            this.#sLoaded[k] = values[k];
        }

        /*if (Array.isArray(key))
            key.forEach((k, i) => {
                this.#crmStorage.set({ [k]: value[i]});

                this.#sLoaded[k] = value[i];
            });
        else {
            this.#crmStorage.set({[key]: value});

            this.#sLoaded[key] = value;
        }*/
    }

    get(key) {
        for(let k in this.#sLoaded) {
            var e = this.#sLoaded[k];

            if (k === key)
                return e;
        }
    }

    remove(keys) { this.#crmStorage.remove(keys); }

    removeAll() { this.#crmStorage.clear(); }
}