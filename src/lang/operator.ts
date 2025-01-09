import { escape, escapeId, format } from 'sqlstring';
import { WhereOperate } from '../types';

export abstract class Operator {

    constructor() {
    }

    format(sql: string, values: any, stringifyObjects?: boolean, timeZone?: string): string {
        // if values is object, not null, not Array;
        if (!Array.isArray(values) && typeof values === 'object' && values !== null) {
            // object not support replace column like ??;
            return sql.replace(/:(\w+)/g, (text, key) => {
                if (Object.prototype.hasOwnProperty.call(values, key)) {
                    return escape(values[key]);
                }
                // if values don't hasOwnProperty, return origin text;
                return text;
            });
        }
        return format(sql, values, stringifyObjects, timeZone);
    }

    /**
     *
     * @param key
     * @param value
     */
    _matchWhereItem(key:string,value:WhereOperate|string|number|boolean|Array<any>){
        let sqls=[];
        let values=[];
        //normal
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'){
            sqls.push('?? = ?');
            values.push(key);
            values.push(value);
        }
        //operate
        else if (Object.hasOwn(value, 'key') || Object.hasOwn(value, 'value')|| Object.hasOwn(value, 'operate')){
            let _value = value as WhereOperate;
            let _key = key=='$or'?_value.key:key;
            let operate = _value.operate??'=';
            if (operate.toUpperCase() =='IN'){
                sqls.push(`?? IN (?)`);
            }else {
                sqls.push(`?? ${operate} ?`);
            }
            values.push(_key);
            values.push(_value.value);
        }
        // array
        else if (Array.isArray(value)){
            let items = value;
            if (key =='$or'){
                let orSqls:string[]=[];
                let orValues:any[] = [];
                let _items = items as WhereOperate[];
                for (const item of _items) {
                    let _key = item.key;
                    let _value = item.value;
                    let result = this._matchWhereItem(_key,_value);
                    orSqls.push(...result.sqls);
                    orValues.push(...result.values);
                }

                sqls.push(` (${orSqls.join(' or ')}) `);
                values.push(...orValues);
            }else {
                sqls.push('?? IN (?)');
                values.push(items);
            }
        }
        return{
            sqls,values
        }

    }

    protected _where(where?: any) {
        if (!where) {
            return '';
        }
        const wheres: string[] = [];
        const values: any[] = [];
        for (const key in where) {
            let result = this._matchWhereItem(key,where[key]);
            wheres.push(...result.sqls)
            values.push(...result.values)
        }
        if (wheres.length > 0) {
            return this.format(' WHERE ' + wheres.join(' AND '), values);
        }
        return '';
    }

    protected _selectColumns(table: string, columns?: string | string[]) {
        if (!columns || columns.length === 0) {
            columns = '*';
        }
        if (columns === '*') {
            return this.format('SELECT * FROM ??', [ table ]);
        }
        return this.format('SELECT ?? FROM ??', [ columns, table ]);
    }

    protected _orders(orders?: string | string[]) {
        if (!orders) {
            return '';
        }
        if (typeof orders === 'string') {
            orders = [ orders ];
        }
        const values: string[] = [];
        for (const value of orders) {
            if (typeof value === 'string') {
                values.push(this.escapeId(value));
            } else if (Array.isArray(value)) {
                // value format: ['name', 'desc'], ['name'], ['name', 'asc']
                let sort = String(value[1]).toUpperCase();
                if (sort !== 'ASC' && sort !== 'DESC') {
                    sort = '';
                }
                if (sort) {
                    values.push(this.escapeId(value[0]) + ' ' + sort);
                } else {
                    values.push(this.escapeId(value[0]));
                }
            }
        }
        return ' ORDER BY ' + values.join(', ');
    }

    protected _limit(limit?: number, offset?: number) {
        if (!limit || typeof limit !== 'number') {
            return '';
        }
        if (typeof offset !== 'number') {
            offset = 0;
        }
        return ' LIMIT ' + offset + ', ' + limit;
    }

    escapeId(value: any, forbidQualified?: boolean): string {
        return escapeId(value, forbidQualified);
    }

    abstract query(sql: string, params?: any[] | object): Promise<any[] | any>;

}
