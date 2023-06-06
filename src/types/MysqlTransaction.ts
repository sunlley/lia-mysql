import {MysqlOperator} from "./MysqlOperator";
import {PoolConnection} from "mysql2/promise";
import {Sql} from "./mysql";


export class MysqlTransaction extends MysqlOperator {

    connection: PoolConnection | null;

    constructor(connection: PoolConnection) {
        super();
        this.connection = connection;
    }

    checkConnection() {
        if (!this.connection) {
            throw new Error('This MysqlTransaction has been released!')
        }

    }

    async release() {
        await this.connection?.release();
        this.connection = null;

    }

    async beginTransaction(): Promise<MysqlTransaction> {
        this.checkConnection();
        await this.connection?.beginTransaction();
        return this;
    }

    query(sql: string, params?: any[] | object): Promise<any> {
        this.checkConnection();
        if (!params) {
            params = [];
        }
        return new Promise(async (resolve_all, reject_all) => {
            try {
                // @ts-ignore
                let [rows, fields] =
                    await this.connection?.query(sql, params ? params : []);
                await this.connection?.release();
                resolve_all(rows);
            } catch (e) {
                reject_all(e);
            }
        })
    }

    queries(sqls: Sql[]) {
        this.checkConnection();
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
                    await this.connection?.release();
                    this.connection = null;
                } catch (e) {
                    await this.connection?.rollback();
                    await this.connection?.release();
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
