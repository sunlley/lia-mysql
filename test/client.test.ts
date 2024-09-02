import {describe, expect, test,it,beforeAll,afterAll,afterEach} from '@jest/globals';
import { AsyncLocalStorage } from 'node:async_hooks';
import { strict as assert } from 'node:assert';
import fs from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import path from 'node:path';
import mm from 'mm';
import config from './config';
import { MysqlInstaller, Config, Client } from '../src';

interface MockMateSpyObject<T extends (...args: any[]) => any> {
  called?: number;
  calledArguments?: Array<Parameters<T>>;
  lastCalledArguments?: Parameters<T>;
}

const mmSpy = <T extends (...args: any[]) => any>(target: T) => target as MockMateSpyObject<T>;

describe('test/client.test.ts', () => {
  const prefix = 'prefix-' + process.version + '-';
  const table = 'lia-test-user';
  let SQL: Client;
  const TARGET = {SQL: {}};

  beforeAll(async () => {
    const installer = new MysqlInstaller(config as Config ,TARGET,'sys|info');
    await installer.load();
    SQL=TARGET.SQL as any;
    try {
      const sql = await fs.readFile(path.join(__dirname, 'sql_init.sql'), 'utf-8');
      await SQL.query(sql);
    } catch (err) {
      console.log('init table error: %s', err);
    }
    await SQL.query('delete from ?? where name like ?', [ table, prefix + '%' ]);
  });

  afterEach(() => {
    mm.restore();
  });

  describe('query(), queryOne()', () => {
    beforeAll(async () => {
      await SQL.query(`insert into ??(name, email, gmt_create, gmt_modified)
        values(?, ?, now(), now())`, [ table, prefix + 'fengmk2', prefix + 'm@fengmk2.com' ]);
      await SQL.query(`insert into ??(name, email, gmt_create, gmt_modified)
        values(?, ?, now(), now())`, [ table, prefix + 'fengmk3', prefix + 'm@fengmk2.com' ]);
    });

    it('should select 2 rows', async () => {
      const rows = await SQL.query<any[]>('select * from ?? where email=? order by id',
        [ table, prefix + 'm@fengmk2.com' ]);
      assert.equal(rows.length, 2);
      assert.equal(rows[0].name, prefix + 'fengmk2');
      assert.equal(rows[1].name, prefix + 'fengmk3');
    });

    it('should select 1 row', async () => {
      const row = await SQL.queryOne<any>('select * from ?? where email=? order by id',
        [ table, prefix + 'm@fengmk2.com' ]);
      assert.equal(row.name, prefix + 'fengmk2');
    });

    it('should support promise', () => {
      return SQL.queryOne<any>('select * from ?? where email=? order by id',
        [ table, prefix + 'm@fengmk2.com' ])
        .then(row => {
          assert.equal(row.name, prefix + 'fengmk2');
        });
    });
  });

  describe('get(table, obj, options), select(table, options)', () => {
    beforeAll(async () => {
      let result = await SQL.insert(table, {
        name: prefix + 'fengmk2-get',
        email: prefix + 'm@fengmk2-get.com',
      });
      assert.equal(result.affectedRows, 1);

      result = await SQL.insert(table, {
        name: prefix + 'fengmk3-get',
        email: prefix + 'm@fengmk2-get.com',
      });
      assert.equal(result.affectedRows, 1);
    });

    it('should get exists object without columns', async () => {
      let user = await SQL.get(table, { email: prefix + 'm@fengmk2-get.com' });
      assert(user);
      assert.deepEqual(Object.keys(user), [ 'id', 'gmt_create', 'gmt_modified', 'name', 'email', 'mobile' ]);
      assert.equal(user.name, prefix + 'fengmk2-get');

      user = await SQL.get(table, { email: prefix + 'm@fengmk2-get.com' }, {
        orders: [[ 'id', 'desc' ]],
      });
      assert(user);
      assert.deepEqual(Object.keys(user), [ 'id', 'gmt_create', 'gmt_modified', 'name', 'email', 'mobile' ]);
      assert.equal(user.name, prefix + 'fengmk3-get');

      user = await SQL.get(table, { email: prefix + 'm@fengmk2-get.com' }, {
        orders: [[ 'id', 'desc' ], 'gmt_modified', [ 'gmt_create', 'asc' ]],
      });
      assert(user);
      assert.deepEqual(Object.keys(user), [ 'id', 'gmt_create', 'gmt_modified', 'name', 'email', 'mobile' ]);
      assert.equal(user.name, prefix + 'fengmk3-get');
    });

    it('should get exists object with columns', async () => {
      const user = await SQL.get(table, { email: prefix + 'm@fengmk2-get.com' }, {
        columns: [ 'id', 'name' ],
      });
      assert(user);
      assert.deepEqual(Object.keys(user), [ 'id', 'name' ]);
      assert.equal(user.name, prefix + 'fengmk2-get');
    });

    it('should get null when row not exists', async () => {
      const user = await SQL.get(table, { email: prefix + 'm@fengmk2-get-not-exists.com' }, {
        columns: [ 'id', 'name' ],
      });
      assert.strictEqual(user, undefined);
    });

    it('should select objects without columns', async () => {
      let users = await SQL.select(table, {
        where: { email: prefix + 'm@fengmk2-get.com' },
      });
      assert(users);
      assert.equal(users.length, 2);
      assert.deepEqual(Object.keys(users[0]), [ 'id', 'gmt_create', 'gmt_modified', 'name', 'email', 'mobile' ]);
      assert.equal(users[0].name, prefix + 'fengmk2-get');

      users = await SQL.select(table, {
        where: { email: prefix + 'm@fengmk2-get.com' },
        orders: [[ 'id', 'desc' ]],
        limit: 1,
      });
      assert(users);
      assert.equal(users.length, 1);
      assert.deepEqual(Object.keys(users[0]), [ 'id', 'gmt_create', 'gmt_modified', 'name', 'email', 'mobile' ]);
      assert.equal(users[0].name, prefix + 'fengmk3-get');

      users = await SQL.select(table, {
        where: { email: prefix + 'm@fengmk2-get.com' },
        orders: [[ 'id', 'desc' ]],
        limit: 1,
        offset: 1,
      });
      assert(users);
      assert.equal(users.length, 1);
      assert.deepEqual(Object.keys(users[0]), [ 'id', 'gmt_create', 'gmt_modified', 'name', 'email', 'mobile' ]);
      assert.equal(users[0].name, prefix + 'fengmk2-get');

      users = await SQL.select(table, {
        where: { email: prefix + 'm@fengmk2-get.com' },
        orders: [[ 'id', 'desc' ]],
        limit: 10,
        offset: 100,
      });
      assert(users);
      assert.equal(users.length, 0);
    });

    it('should select without options.where', async () => {
      const users = await SQL.select(table);
      assert(users);
      assert.equal(users.length > 2, true);
      assert.deepEqual(Object.keys(users[0]), [ 'id', 'gmt_create', 'gmt_modified', 'name', 'email', 'mobile' ]);
    });

    it('should select with options.orders', async () => {
      let users = await SQL.select(table, {
        orders: 'id',
      });
      assert(users.length >= 2);
      assert(users[0].id < users[1].id);

      users = await SQL.select(table, {
        orders: [[ 'id', 'desc' ], null, 1 ],
      });
      assert(users.length >= 2);
      assert(users[0].id > users[1].id);

      users = await SQL.select(table, {
        orders: [ 'id', [ 'name', 'foo' ]],
      });
      assert(users.length >= 2);
      assert(users[0].id < users[1].id);
    });
  });

  describe('insert(table, row[s])', () => {
    it('should set now() as a default value for `gmt_create` and `gmt_modified`', async () => {
      const result = await SQL.insert(table, [{
        name: prefix + 'fengmk2-insert00',
        email: prefix + 'm@fengmk2-insert.com',
      }, {
        name: prefix + 'fengmk2-insert01',
        email: prefix + 'm@fengmk2-insert.com'
      }]);
      assert.equal(result.affectedRows, 2);

      const result1 = await SQL.get(table, { name: prefix + 'fengmk2-insert00' }, { columns: [ 'gmt_create', 'gmt_modified' ] });
      const result2 = await SQL.get(table, { name: prefix + 'fengmk2-insert01' }, { columns: [ 'gmt_create', 'gmt_modified' ] });
      assert.deepEqual(result1.gmt_create, result2.gmt_create);
      assert.deepEqual(result2.gmt_modified, result2.gmt_modified);
    });

    it('should insert one row', async () => {
      const result = await SQL.insert(table, {
        name: prefix + 'fengmk2-insert1',
        email: prefix + 'm@fengmk2-insert.com',
      });
      assert.equal(result.affectedRows, 1);
    });

    it('should insert with columns', async () => {
      const result = await SQL.insert(table, {
        name: prefix + 'fengmk2-insert-with-columns',
        email: prefix + 'm@fengmk2-insert-with-columns.com',
        ignoretitle: 'foo title',
      }, {
        columns: [ 'name', 'email' ],
      });
      assert.equal(result.affectedRows, 1);
    });

    it('should insert multi rows', async () => {
      const result = await SQL.insert(table, [
        {
          name: prefix + 'fengmk2-insert2',
          email: prefix + 'm@fengmk2-insert.com',
        },
        {
          name: prefix + 'fengmk2-insert3',
          email: prefix + 'm@fengmk2-insert.com',
        },
      ]);
      assert.equal(result.affectedRows, 2);
      const row = await SQL.get(table, { id: result.insertId });
      assert(row);
      assert.equal(row.id, result.insertId);
    });

    it('should insert multi fail', async () => {
      try {
        await SQL.insert(table, [
          {
            name: prefix + 'fengmk2-insert4',
            email: prefix + 'm@fengmk2-insert.com',
          },
          {
            name: prefix + 'fengmk2-insert4',
            email: prefix + 'm@fengmk2-insert.com',
          },
        ]);
        throw new Error('should not run this');
      } catch (err:any) {
        assert.equal(err.code, 'ER_DUP_ENTRY');
      }
      const row = await SQL.get(table, { name: prefix + 'fengmk2-insert4' });
      assert(!row);
    });

    it('should part success on Duplicate key without transaction', async () => {
      const result = await SQL.insert(table, {
        name: prefix + 'fengmk2-insert-no-tran',
        email: prefix + 'm@fengmk2-insert.com',
      });
      assert.equal(result.affectedRows, 1);
      let rows = await SQL.select(table, {
        where: { name: prefix + 'fengmk2-insert-no-tran' },
      });
      assert.equal(rows.length, 1);

      try {
        await SQL.insert(table, {
          name: prefix + 'fengmk2-insert-no-tran',
          email: prefix + 'm@fengmk2-insert.com',
        });
        throw new Error('should not run this');
      } catch (err:any) {
        assert.equal(err.code, 'ER_DUP_ENTRY');
      }
      rows = await SQL.select(table, {
        where: { name: prefix + 'fengmk2-insert-no-tran' },
      });
      assert.equal(rows.length, 1);
    });

  });


});
