import { Client } from './lang';

declare global {
  // eslint-disable-next-line no-var
  var [key]: any;
  var SQL: Client;
  var SQLS: Record<any, Client>;
  var __SQL_CACHE: any;
}
export default global;
