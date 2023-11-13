import {MysqlOperator} from "./MysqlOperator";
import {Pool} from "mysql2";
import {Sql} from "./mysql";
import {Pool as PromisePool, PoolConnection} from "mysql2/promise";


export class MysqlTransaction extends MysqlOperator {

    pool: Pool | null;
    pool2: PromisePool | null;
    connection?: PoolConnection|null;

    constructor(pool: Pool) {
        super();
        this.pool=pool;
        this.pool2 = pool.promise();
    }

    async getConnection():Promise<PoolConnection> {
        if (!this.pool2) {
            throw new Error('This MysqlTransaction has been released!')
        }
        this.connection=await this.pool2.getConnection();
        if (!this.connection){
            throw new Error('This MysqlTransaction has no connection!')
        }
        return this.connection;
    }

    async release() {
        await this.pool2?.releaseConnection(this.connection as PoolConnection)
        this.connection = null;
    }

    async beginTransaction(): Promise<MysqlTransaction> {
        await this.getConnection();
        await this.connection?.beginTransaction();
        return this;
    }

    async query(sql: string, params?: any[] | object): Promise<any> {
        await this.getConnection();
        if (!params) {
            params = [];
        }
        return new Promise(async (resolve_all, reject_all) => {
            try {
                // @ts-ignore
                let [rows, fields] =
                    await this.connection?.query(sql, params ? params : []);
                // await this.connection?.
                resolve_all(rows);
            } catch (e) {
                reject_all(e);
            }
        })
    }

    async queries(sqls: Sql[]) {
        await this.getConnection();
        return new Promise(async (resolve_all, reject_all) => {
            try {
                let results = [];
                try {
                    for (const sql of sqls) {
                        // @ts-ignore
                        let [rows, fields] =
                            await this.connection?.query(sql.sql, sql.params ? sql.params : []);
                        results.push(rows);
                    }
                    await this.connection?.commit();
                    // await this.connection?.release();
                    this.connection = null;
                } catch (e) {
                    await this.connection?.rollback();
                    // await this.connection?.release();
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
