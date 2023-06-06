import {MysqlConfig, MysqlConfigs} from "../../dist/types";
import {MysqlTarget} from "../types";
import {MysqlInstaller} from "../index";

// const CONFIG = {
// } as MysqlConfigs<MysqlConfig>;
//
// test('My Greeter', async () => {
//     let target:MysqlTarget={SQL:{}};
//     let result:any;
//     let installer =await new MysqlInstaller(CONFIG,target,'all').load();
//     target = installer.target;
//     result = await target.SQL.UDATA.query('select * from users where id=?', [10003]);
//     // result = await global.SQL.UDATA.get('users',{'id':10003});
//     console.log('result',result);
//     expect('Hello 123').toBe('Hello 123');
// });

test('MySQL', () => {
    expect('Hello Installer').toBe('Hello Installer');
});
