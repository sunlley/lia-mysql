import { afterEach, beforeAll, describe, it } from '@jest/globals';
import { strict as assert } from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import mm from 'mm';
import { Client, Config, MysqlInstaller } from '../src';

interface MockMateSpyObject<T extends (...args: any[]) => any> {
  called?: number;
  calledArguments?: Array<Parameters<T>>;
  lastCalledArguments?: Parameters<T>;
}

const config = {
  host: process.env.TEST_ALI_RDS_HOST || '127.0.0.1',
  port: parseInt(process.env.TEST_ALI_RDS_PORT || '3306'),
  user: process.env.TEST_ALI_RDS_USER || 'root',
  password: process.env.TEST_ALI_RDS_PASSWORD || 'root123456',
  database: process.env.TEST_ALI_RDS_DATABASE || 'test',
};
const mmSpy = <T extends (...args: any[]) => any>(target: T) => target as MockMateSpyObject<T>;

it('test mysql', async () => {
  assert.equal('a', 'a');
});

// describe('test/client.test.ts', () => {
//   const prefix = 'prefix-' + process.version + '-';
//   const table = 'lia-test-user';
//   let SQL: Client;
//   const TARGET = { SQL: {} };
//
//   beforeAll(async () => {
//     const installer = new MysqlInstaller(config as Config, TARGET, 'sys|info');
//     await installer.load();
//     SQL = TARGET.SQL as any;
//     try {
//       const sql = await fs.readFile(path.join(__dirname, 'sql_init.sql'), 'utf-8');
//       await SQL.query(sql);
//     } catch (err) {
//       console.log('init table error: %s', err);
//     }
//     await SQL.query('delete from ?? where name like ?', [table, prefix + '%']);
//   });
//   afterEach(() => {
//     mm.restore();
//   });
//
//   describe('query(), queryOne()', () => {
//     beforeAll(async () => {
//       await SQL.query(
//         `insert into ??(name, email, gmt_create, gmt_modified)
//         values(?, ?, now(), now())`,
//         [table, prefix + 'fengmk2', prefix + 'm@fengmk2.com'],
//       );
//       await SQL.query(
//         `insert into ??(name, email, gmt_create, gmt_modified)
//         values(?, ?, now(), now())`,
//         [table, prefix + 'fengmk3', prefix + 'm@fengmk2.com'],
//       );
//     });
//
//     it('should select 2 rows', async () => {
//       const rows = await SQL.query<any[]>('select * from ?? where email=? order by id', [
//         table,
//         prefix + 'm@fengmk2.com',
//       ]);
//       assert.equal(rows.length, 2);
//       assert.equal(rows[0].name, prefix + 'fengmk2');
//       assert.equal(rows[1].name, prefix + 'fengmk3');
//     });
//
//     it('should select 1 row', async () => {
//       const row = await SQL.queryOne<any>('select * from ?? where email=? order by id', [
//         table,
//         prefix + 'm@fengmk2.com',
//       ]);
//       assert.equal(row.name, prefix + 'fengmk2');
//     });
//   });
// });
