import BaseInstaller, {Cluster} from '../base/installer';
import {createPool, PoolConnection, Pool} from 'mysql2';
import {MysqlConfig, MysqlConfigs, MysqlTarget, MysqlClient} from "../types";

declare global {
    var [key]: any;
    var SQL: any;
    var __SQL_CACHE: any;
}

export class MysqlInstaller extends BaseInstaller {
    private readonly configs: any;

    /**
     *
     * @param configs
     * @param target mysql
     * @param debug debug model
     */
    constructor(configs: MysqlConfig | MysqlConfigs<MysqlConfig>,
                target: MysqlTarget | null,
                debug: boolean | Cluster | string = false) {
        target = target ? target : global as MysqlTarget;
        if (!target.__SQL_CACHE) {
            target.__SQL_CACHE = {};
        }
        if (!target.SQL) {
            target.SQL = {}
        }
        let mul = !(configs instanceof MysqlConfig);
        if (mul) {
            if (configs.uri || configs.host) {
                mul = false;
            }
        }
        super('MYSQL', target, debug, mul);
        this.configs = configs;

    }

    async install() {
        if (this.multiple) {
            for (const key in this.configs) {
                await this.createClient(this.configs[key], key);
            }
        } else {
            await this.createClient(this.configs);
        }
    }

    querySql(connect: PoolConnection, sql: any, params: any) {
        return new Promise((resolve, reject) => {
            connect.query(sql, params, (error: any, result: any) => {
                if (error) {
                    reject(error)
                } else {
                    /*
                      {
                        fieldCount: 0,
                        affectedRows: 1,
                        insertId: 0,
                        info: 'Rows matched: 1  Changed: 1  Warnings: 0',
                        serverStatus: 35,
                        warningStatus: 0,
                        changedRows: 1
                    }
                     */
                    resolve(result);
                }
            })
        })
    }

    /**
     * @private
     * @param name
     */
    _matchName(name?: string | null) {
        if (!name) {
            // this.logInfo(`createClient[ default ]: option`, config);
            return null;

        } else {
            return name.toUpperCase();
            // this.logInfo(`createClient[ ${name} ]: option`, config);
        }
    }

    createClient(options: MysqlConfig, name?: string | null): Promise<MysqlClient> {
        const _this = this;
        name = this._matchName(name);
        const id = _this.randomStr();
        const config = options;
        return new Promise(async (resolve, reject) => {
            // 使用连接池，提升性能
            let pool1 = createPool(config) as Pool;
            const pool = pool1.promise();
            pool.on('acquire', (connection: any) => {
                _this.logSys(`client[ ${id} ]: acquire`);
            })
            pool.on('connection', (connection: any) => {
                _this.logSys(`client[ ${id} ]: connection`);
            })
            pool.on('enqueue', () => {
                _this.logSys(`client[ ${id} ]: enqueue`);
            })
            pool.on('release', (connection: any) => {
                _this.logSys(`client[ ${id} ]: release`);
            })

            let client = new MysqlClient(pool);

            if (name) {
                _this._target.SQL[name] = client;
            } else {
                _this._target.SQL = client;
            }
            resolve(client);
        })
    }

}
