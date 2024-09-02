# Mysql Installer
简化MySQL使用

![](https://img.shields.io/badge/version-1.0.0-lightgrey)
![](https://img.shields.io/badge/node-16.%2B-brightgreen)

## 安装
```shell
$ npm install lia-mysql
```

## 1如何使用 MysqlInstaller
### 1.1 Mysql 初始化 (单实例模式)
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
### 1.2 Mysql 使用 (单实例模式)
#### 查询
```typescript
const result = await TARGET.SQL.query('select * from users where id=?', [100])
console.log(result);

```
#### 插入
```typescript
const row = {
  name: 'fengmk2',
  otherField: 'other field value',
};
const result = await TARGET.SQL.insert('table-name', row);
console.log(result);

```
- 插入多条

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


#### 更新

- 使用 primary key: `id` 更新

```typescript
const row = {
  id: 123,
  name: 'fengmk2',
  otherField: 'other field value',
};
const result = await TARGET.SQL.update('table-name', row);
console.log(result);
```
- 使用 `options.where` 和 `options.columns` 更新

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

- 使用 primary key: `id` 更新

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

- 使用 `row` and `where` 更新

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

#### 获取

- 获取单条

```typescript
const row = await TARGET.SQL.get('table-name', { name: 'fengmk2' });

=> SELECT * FROM `table-name` WHERE `name` = 'fengmk2'
```


### 2.1 Mysql 初始化 (多实例模式)

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

### 2.2 Mysql 使用 (多实例模式)
多实例模式与单实例模式基本相同，只是需要在SQL实例上指定数据库实例，例如：
#### 查询
```typescript
const result = await TARGET.SQL.APP1.query('select * from users where id=?', [100])
console.log(result);

```

其他操作请参照 `单实例`模式
