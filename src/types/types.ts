import { Client, Config } from '../lang';
import { QueryResult } from 'mysql2/typings/mysql/lib/protocol/packets';

export type Cluster = 'info' | 'error' | 'sys' | 'all';
export const Events = {
  create: 'create',
  initial: 'initial',
  ready: 'ready',
};


/**
 * Construct a type with a set of properties K of type T
 */
export type MysqlConfigs<T extends Config>={
  [P in string]: T;
};

export type MysqlTarget = {
  SQL:Record<any, Client>,
  __SQL_CACHE?:any
}

export type Sql={
  sql:string,
  params:any[]
}


export type SelectOption = {
  where?: object;
  columns?: string | string[];
  orders?: string | any[];
  limit?: number;
  offset?: number;
};

export type InsertOption = {
  columns?: string[];
};

export type InsertResult = {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  serverStatus: number;
  warningCount: number;
  message: string;
  protocol41: boolean;
  changedRows: number;
} & QueryResult;

export type UpdateOption = {
  where?: object;
  columns?: string[];
};

export type UpdateResult = InsertResult;
export type DeleteResult = InsertResult;
export type LockResult = InsertResult;

export type UpdateRow = {
  row?: object;
  where?: object;
  [key: string]: any;
};

export type LockTableOption = {
  tableName: string;
  lockType: string;
  tableAlias: string;
};

export type BeforeQueryHandler = (sql: string) => string | undefined | void;
export type AfterQueryHandler = (sql: string, result: any, execDuration: number, err?: Error) => void;