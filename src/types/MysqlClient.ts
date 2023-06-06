import {DeleteResult, InsertOption, InsertResult, SelectOption, UpdateOption, UpdateResult, UpdateRow} from "./mysql";
import {MysqlOperator} from "./MysqlOperator";
import {MysqlTransaction} from "./MysqlTransaction";
import {PoolConnection} from "mysql2/promise";

export class MysqlClient extends MysqlOperator{

    private pool: PoolConnection;

    constructor(pool: PoolConnection) {
        super();
        this.pool = pool;
    }

    async getTransaction(){
        let connection = await this.pool.getConnection();
        return new MysqlTransaction(connection)
    }

    query(sql: string, params?: any[] | object): Promise<any[] | any>  {
        if (!params) {
            params = [];
        }
        return new Promise(async (resolve_all, reject_all) => {
            try {
                let connection = await this.pool.getConnection();
                let [rows, fields] =
                    await connection.query(sql, params ? params : []);
                await connection.release();
                resolve_all(rows);
            } catch (e) {
                reject_all(e);
            }
        })
    }

    queryOne(sql: string, params?: any[] | object){
        return new Promise(async (resolve_all, reject_all) => {
            try {
                let items = await this.query(sql, params);
                if (items && items.length > 0) {
                    resolve_all(items[0]);
                }
                reject_all(new Error('No row found'));
            } catch (e) {
                reject_all(e);
            }
        });
    }

    // select(sql: string, params?: any[] | object): Promise<any[]>  {
    //     if (!params) {
    //         params = [];
    //     }
    //     return new Promise(async (resolve_all, reject_all) => {
    //         try {
    //             let connection = await this.pool.promise().getConnection();
    //             let [rows, fields] =
    //                 await connection.query(sql, params ? params : []);
    //             await connection.release();
    //             if (Array.isArray(rows)){
    //                 resolve_all(rows);
    //             }
    //             resolve_all([rows]);
    //         } catch (e) {
    //             reject_all(e);
    //         }
    //     })
    // }

    async count(table: string, where?: object) {
        const sql = this.format('SELECT COUNT(*) as count FROM ??', [ table ]) +
            this._where(where);
        const rows = await this.query(sql);
        return rows[0].count;
    }

    /**
     * Select rows from a table
     *
     * @param  {String} table     table name
     * @param  {Object} [option] optional params
     *  - {Object} where          query condition object
     *  - {Array|String} columns  select columns, default is `'*'`
     *  - {Array|String} orders   result rows sort condition
     *  - {Number} limit          result limit count, default is no limit
     *  - {Number} offset         result offset, default is `0`
     * @return {Array} result rows
     */
    async select(table: string, option?: SelectOption): Promise<any[]> {
        option = option || {};
        const sql = this._selectColumns(table, option.columns) +
            this._where(option.where) +
            this._orders(option.orders) +
            this._limit(option.limit, option.offset);
        return await this.query(sql);
    }

    async get(table: string, where?: object, option?: SelectOption) {
        option = option || {};
        option.where = where;
        option.limit = 1;
        option.offset = 0;
        const rows = await this.select(table, option);
        return rows && rows[0] || null;
    }

    async insert(table: string, rows: object | object[], option?: InsertOption): Promise<InsertResult> {
        option = option || {};
        let insertRows: object[];
        let firstObj: object;
        // insert(table, rows)
        if (Array.isArray(rows)) {
            firstObj = rows[0];
            insertRows = rows;
        } else {
            // insert(table, row)
            firstObj = rows;
            insertRows = [ rows ];
        }
        if (!option.columns) {
            option.columns = Object.keys(firstObj);
        }

        const params = [ table, option.columns ];
        const strs: string[] = [];
        for (const row of insertRows) {
            const values: any[] = [];
            for (const column of option.columns) {
                // @ts-ignore
                values.push(row[column]);
            }
            strs.push('(?)');
            params.push(values);
        }

        const sql = this.format('INSERT INTO ??(??) VALUES' + strs.join(', '), params);
        return await this.query(sql);
    }

    async update(table: string, row: object, option?: UpdateOption): Promise<UpdateResult> {
        option = option || {};
        if (!option.columns) {
            option.columns = Object.keys(row);
        }
        if (!option.where) {
            if (!('id' in row)) {
                throw new Error('Can not auto detect update condition, please set option.where, or make sure obj.id exists');
            }
            option.where = {
                id: row.id,
            };
        }

        const sets: string[] = [];
        const values: any[] = [];
        for (const column of option.columns) {
            sets.push('?? = ?');
            values.push(column);
            // @ts-ignore
            values.push(row[column]);
        }
        const sql = this.format('UPDATE ?? SET ', [ table ]) +
            this.format(sets.join(', '), values) +
            this._where(option.where);
        return await this.query(sql);
    }

    /**
     * Update multiple rows from a table
     *
     * UPDATE `table_name` SET
     *  `column1` CASE
     *     WHEN  condition1 THEN 'value11'
     *     WHEN  condition2 THEN 'value12'
     *     WHEN  condition3 THEN 'value13'
     *     ELSE `column1` END,
     *  `column2` CASE
     *     WHEN  condition1 THEN 'value21'
     *     WHEN  condition2 THEN 'value22'
     *     WHEN  condition3 THEN 'value23'
     *     ELSE `column2` END
     * WHERE condition
     *
     * See MySQL Case Syntax: https://dev.mysql.com/doc/refman/5.7/en/case.html
     *
     * @param {String} table table name
     * @param {Array<Object>} updateRows Object Arrays
     *    each Object needs a primary key `id`, or each Object has `row` and `where` properties
     *    e.g.
     *      [{ id: 1, name: 'fengmk21' }]
     *      or [{ row: { name: 'fengmk21' }, where: { id: 1 } }]
     * @return {object} update result
     */
    async updateRows(table: string, updateRows: UpdateRow[]): Promise<UpdateResult> {
        if (!Array.isArray(updateRows)) {
            throw new Error('updateRows should be array');
        }
        /**
         * {
         *  column: {
         *    when: [ 'WHEN condition1 THEN ?', 'WHEN condition12 THEN ?' ],
         *    then: [ value1, value1 ]
         *  }
         * }
         */
        const SQL_CASE:any = {};
        // e.g. { id: [], column: [] }
        const WHERE:any = {};

        for (const updateRow of updateRows) {
            const row = updateRow.row ?? updateRow;
            let where = updateRow.where;
            const hasId = 'id' in row;
            if (!hasId && !where) {
                throw new Error('Can not auto detect updateRows condition, please set updateRow.where, or make sure updateRow.id exists');
            }

            // convert { id, column } to { row: { column }, where: { id } }
            if (hasId) {
                where = { id: updateRow.id };
            }

            let whereString = this._where(where);
            whereString = !whereString.includes('WHERE') ? whereString : whereString.substring(whereString.indexOf('WHERE') + 5);
            for (const key in row) {
                if (key === 'id') continue;
                if (!SQL_CASE[key]) {
                    SQL_CASE[key] = { when: [], then: [] };
                }
                SQL_CASE[key].when.push(' WHEN ' + whereString + ' THEN ? ');
                // @ts-ignore
                SQL_CASE[key].then.push(row[key]);
            }

            for (const key in where) {
                if (!WHERE[key]) {
                    WHERE[key] = [];
                }
                // @ts-ignore
                if (!WHERE[key].includes(where[key])) {
                    // @ts-ignore
                    WHERE[key].push(where[key]);
                }
            }
        }

        let SQL = 'UPDATE ?? SET ';
        let VALUES = [ table ];

        const TEMPLATE: string[] = [];
        for (const key in SQL_CASE) {
            let templateSql = ' ?? = CASE ';
            VALUES.push(key);
            templateSql += SQL_CASE[key].when.join(' ');
            VALUES = VALUES.concat(SQL_CASE[key].then);
            templateSql += ' ELSE ?? END ';
            TEMPLATE.push(templateSql);
            VALUES.push(key);
        }

        SQL += TEMPLATE.join(' , ');
        SQL += this._where(WHERE);

        /**
         * e.g.
         *
         * updateRows(table, [
         *  {id: 1, name: 'fengmk21', email: 'm@fengmk21.com'},
         *  {id: 2, name: 'fengmk22', email: 'm@fengmk22.com'},
         *  {id: 3, name: 'fengmk23', email: 'm@fengmk23.com'},
         * ])
         *
         * UPDATE `ali-sdk-test-user` SET
         *  `name` =
         *    CASE
         *      WHEN  `id` = 1 THEN 'fengmk21'
         *      WHEN  `id` = 2 THEN 'fengmk22'
         *      WHEN  `id` = 3 THEN 'fengmk23'
         *      ELSE `name` END,
         *  `email` =
         *    CASE
         *      WHEN  `id` = 1 THEN 'm@fengmk21.com'
         *      WHEN  `id` = 2 THEN 'm@fengmk22.com'
         *      WHEN  `id` = 3 THEN 'm@fengmk23.com'
         *      ELSE `email` END
         *  WHERE `id` IN (1, 2, 3)
         */
        const sql = this.format(SQL, VALUES);
        return await this.query(sql);
    }

    async delete(table: string, where?: object | null): Promise<DeleteResult> {
        const sql = this.format('DELETE FROM ??', [ table ]) +
            this._where(where);
        return await this.query(sql);
    }


}
