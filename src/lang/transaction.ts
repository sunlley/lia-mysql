import { Operator } from './operator';
import { Pool } from 'mysql2';
import { Pool as PromisePool, PoolConnection } from 'mysql2/promise';
import { Sql } from '../types';

export class Transaction extends Operator {
  pool: Pool | null;
  pool2: PromisePool | null;
  connection?: PoolConnection | null;

  constructor(pool: Pool) {
    super();
    this.pool = pool;
    this.pool2 = pool.promise();
  }

  async getConnection(): Promise<PoolConnection> {
    if (!this.pool2) {
      throw new Error('This MysqlTransaction has been released!');
    }
    this.connection = await this.pool2.getConnection();
    if (!this.connection) {
      throw new Error('This MysqlTransaction has no connection!');
    }
    return this.connection;
  }

  async release() {
    this.pool2?.releaseConnection(this.connection as PoolConnection);
    this.connection = null;
  }

  async beginTransaction(): Promise<Transaction> {
    await this.getConnection();
    await this.connection?.beginTransaction();
    return this;
  }

  async query(sql: string, params?: any[] | object): Promise<any> {
    await this.getConnection();
    if (!params) {
      params = [];
    }
    return new Promise((resolve_all, reject_all) => {
      this.connection
        ?.query(sql, params ? params : [])
        .then(([rows, fields]) => {
          resolve_all(rows);
        })
        .catch((ex) => {
          reject_all(ex);
        });
    });
  }

  async queries(sqls: Sql[]) {
    await this.getConnection();
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async(resolve_all, reject_all) => {
      try {
        let results = [];
        try {
          for (const sql of sqls) {
            // eslint-disable-next-line no-unsafe-optional-chaining
            let [rows]: any = await this.connection?.query(sql.sql, sql.params ? sql.params : []);
            results.push(rows);
          }
          await this.connection?.commit();
          this.connection = null;
        } catch (e) {
          await this.connection?.rollback();
          this.connection = null;
          reject_all(e);
        }
        resolve_all(results);
      } catch (e) {
        reject_all(e);
      }
    });
  }
}
