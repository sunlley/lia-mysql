import { escape, escapeId, format } from 'sqlstring';

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

    protected _where(where?: any) {
        if (!where) {
            return '';
        }

        const wheres: string[] = [];
        const values: any[] = [];
        for (const key in where) {
            let value = where[key];
            if (Array.isArray(value)) {
                wheres.push('?? IN (?)');
            } else {
                if (value === null || value === undefined) {
                    wheres.push('?? IS ?');
                } else {
                    if (Object.hasOwn(value, 'operate')){
                        wheres.push(`?? ${value['operate']} ?`);
                        value = value['value'];
                    }else {
                        wheres.push('?? = ?');
                    }
                }
            }
            values.push(key);
            values.push(value);
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
