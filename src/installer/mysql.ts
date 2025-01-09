import { BaseInstaller } from './base';
import { createPool, PoolConnection, Pool } from 'mysql2';
import { MysqlConfigs, MysqlTarget } from '../types';
import { Cluster } from '../types';
import { Client, Config } from '../lang';

export class MysqlInstaller extends BaseInstaller {
  private readonly configs: any;

  /**
   *
   * @param configs
   * @param target mysql
   * @param debug debug model
   */
  constructor(
    configs: Config | MysqlConfigs<Config>,
    target: MysqlTarget | null,
    debug: boolean | Cluster | string = false,
  ) {
    target = target ? target : (global as MysqlTarget);
    if (!target.__SQL_CACHE) {
      target.__SQL_CACHE = {};
    }
    let mul = !(configs instanceof Config);
    if (mul) {
      if (configs.uri || configs.host) {
        mul = false;
      }
    }
    super('MYSQL', target, debug, mul);
    this.configs = configs;
  }

  async load(): Promise<MysqlInstaller> {
    await super.load();
    return this;
  }

  async install() {
    if (this.multiple) {
      for (const key in this.configs) {
        await this.createClient(this.configs[key], key);
      }
    } else {
      await this.createClient(this.configs,'defult');
    }
  }

  querySql(connect: PoolConnection, sql: any, params: any) {
    return new Promise((resolve, reject) => {
      connect.query(sql, params, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * @private
   * @param name
   */
  _matchName(name: string) {
    return name.toUpperCase();
  }

  createClient(options: Config, name: string): Promise<Client> {
    name = this._matchName(name);
    const id = this.randomStr();
    const config = options;
    return new Promise((resolve, reject) => {
      // 使用连接池，提升性能
      let pool1 = createPool(config);
      // const pool = pool1.promise();
      pool1.on('acquire', (connection: any) => {
        this.logSys(`client[ ${id} ]: acquire`);
      });
      pool1.on('connection', (connection: any) => {
        this.logSys(`client[ ${id} ]: connection`);
      });
      pool1.on('enqueue', () => {
        this.logSys(`client[ ${id} ]: enqueue`);
      });
      pool1.on('release', (connection: any) => {
        this.logSys(`client[ ${id} ]: release`);
      });

      let client = new Client(pool1);
      if (name==='DEFAULT'){
        this._target.SQL = client;
      }
      this._target.SQLS[name] = client;
      resolve(client);
    });
  }
}
