# Mysql Installer
Simplify the use of MySQL

![](https://img.shields.io/badge/version-1.0.2-lightgrey)
![](https://img.shields.io/badge/node-18.%2B-brightgreen)

## Installer
Using npm:
```shell
$ npm install lia-mysql
```

## How to Use MysqlInstaller
### 1.1 Mysql Initial (single mode)
```typescript
import {MysqlInstaller,Config} from "core-mysql";
const TARGET = {SQL: {}};
const config = {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "root12345",
    database: "test"
}
const installer = new MysqlInstaller(config as Config,TARGET,'sys|info');
await installer.load();
```
### 1.2 Mysql Use (single mode)
#### query
```typescript
const result = await TARGET.SQL.query('select * from users where id=?', [100])
console.log(result);

```

#### Select
```typescript
const rows = await db.select('table-name', {
  where: {
    type: 'javascript'
  },
  columns: ['author', 'title'],
  orders: [['id', 'desc']]
});
console.log(rows);

=> SELECT `author`, `title` FROM `table-name`
WHERE `type` = 'javascript' ORDER BY `id` DESC

```

#### Insert
```typescript
const row = {
  name: 'fengmk2',
  otherField: 'other field value',
};
const result = await TARGET.SQL.insert('table-name', row);
console.log(result);

```
- Insert multi rows

```typescript
const rows = [{
    name: 'fengmk2',
    otherField: 'other field value',
}, {
    name: 'fengmk3',
    otherField: 'other field value',
}];
const result = await TARGET.SQL.insert('table-name', rows);
console.log(result);

```

#### Update

- Update a row with primary key: `id`

```typescript
const row = {
  id: 123,
  name: 'fengmk2',
  otherField: 'other field value',
};
const result = await TARGET.SQL.update('table-name', row);
console.log(result);
```
- Update a row with `options.where` and `options.columns`

```typescript
const row = {
  name: 'fengmk2',
  otherField: 'other field value',
};
const result = await TARGET.SQL.update('table-name', row, {
  where: { name: row.name },
  columns: [ 'otherField' ]
});
console.log(result);
```

#### Update multiple rows

- Update multiple rows with primary key: `id`

```typescript
const options = [{
  id: 123,
  name: 'fengmk2',
  email: 'm@fengmk2.com',
  otherField: 'other field value',
}, {
   id: 124,
  name: 'fengmk2_2',
  email: 'm@fengmk2_2.com',
  otherField: 'other field value 2',
}]
const result = await TARGET.SQL.updateRows('table-name', options);
console.log(result);
```

- Update multiple rows with `row` and `where` properties

```typescript
const options = [{
  row: {
    email: 'm@fengmk2.com',
    otherField: 'other field value',
  },
  where: {
    id: 123,
    name: 'fengmk2',
  }
}, {
  row: {
    email: 'm@fengmk2_2.com',
    otherField: 'other field value2',
  }, 
  where: {
    id: 124,
    name: 'fengmk2_2',
  }
}]
const result = await TARGET.SQL.updateRows('table-name', options);
console.log(result);
```

#### Get

- Get a row

```typescript
const row = await TARGET.SQL.get('table-name', { name: 'fengmk2' });

=> SELECT * FROM `table-name` WHERE `name` = 'fengmk2'
```


### 2.1 Mysql Initial (multi mode)

```typescript
import {MysqlInstaller,Config,MysqlConfigs} from "core-installer";
const TARGET = {SQL: {}};
const config = {
    APP1:{
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "root12345",
        database: "test"
    }
}
const installer = new MysqlInstaller(config as MysqlConfigs<Config>,TARGET,'sys|info');
await installer.load();
```

### 2.2 Mysql Use (multi mode)
The multi-instance mode is basically the same as the single-instance mode, except that the database instance needs to be specified on the SQL instance, for example:
#### query
```typescript
const result = await TARGET.SQL.APP1.query('select * from users where id=?', [100])
console.log(result);

```

For other operations, please refer to the single mode
