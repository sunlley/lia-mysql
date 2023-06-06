import {EventEmitter} from "events";

export type Cluster = 'info' | 'error' | 'sys' | 'all';
export const Events = {
    create: 'create',
    initial: 'initial',
    ready: 'ready',
};

abstract class Installer extends EventEmitter {
    name: string;
    _target: any;
    debug: string;
    initial: boolean = false;
    multiple: boolean = false;

    protected constructor(name: string,
                target: any,
                debug: boolean | Cluster | string,
                multiple: boolean
    ) {
        super();
        this.name = name;
        this._target = target != null ? target : this;
        this.multiple = multiple;
        this.debug = debug == true ? 'all' : debug ? debug + '' : '';
        this.emit(Events.create);
    }

    public get target(){
        return this._target;
    }

    async load():Promise<Installer>{
        const _this = this;
        return new Promise(async (resolve, reject) => {
            try {
                this.emit(Events.initial);
                this.logInfo('install','multiple',this.multiple);
                await this.install();
                this.initial = true;
                this.emit(Events.ready);
                resolve(_this);
            } catch (e) {
                reject(e);
            }
        });
    }

    protected logInfo(...data: any) {
        if (this.debug == '') {
            return;
        }
        if (this.debug.indexOf('info') >= 0 || this.debug.indexOf('all') >= 0) {
            this.log(...data);
        }
    }

    protected logError(...data: any) {
        if (this.debug == '') {
            return;
        }
        if (this.debug.indexOf('error') >= 0 || this.debug.indexOf('all') >= 0) {
            this.log(...data);
        }
    }

    protected logSys(...data: any) {
        if (this.debug == '') {
            return;
        }
        if (this.debug.indexOf('sys') >= 0 || this.debug.indexOf('all') >= 0) {
            this.log(...data);
        }
    }

    protected log(...data: any) {
        if (this.debug) {
            // @ts-ignore
            console.log(`🐰😁[${this.name}]`, `${this.dateTime()}`, ...data)
        }
    }

    protected dateTime() {
        const date = new Date();
        // let f ='hh:mm:ss';
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

    protected randomInt(maxNum: number) {
        if (maxNum <= 0) {
            return 0;
        }
        const minNum = 0;
        try {
            return parseInt(`${Math.random() * (maxNum - minNum + 1) + minNum}`, 10);
        } catch (e) {
        }
        return 0;
    }

    protected randomStr(length = 10) {
        let e = '';
        for (let n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890', o = 0;
             o < length; o++) {
            e += n.charAt(Math.floor(Math.random() * n.length));
        }
        return e;
    }

    async install() {
    }

}

export default Installer;
