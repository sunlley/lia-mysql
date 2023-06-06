import {TEST_CONFIG} from "./config";
import {MysqlInstaller} from "../src";
import {MysqlConfig, MysqlConfigs, MysqlTarget} from "../src/types";

const test = async () => {
    let target: MysqlTarget = {SQL: {}};
    let result: any;
    let installer = await new MysqlInstaller(TEST_CONFIG.mysql as MysqlConfigs<MysqlConfig>, target, 'all').load();
    target = installer.target;
    result = await target.SQL.UDATA.query('select * from users where id=?', [10003]);
    // result = await global.SQL.UDATA.get('users',{'id':10003});
    console.log('result', result);
}
test()
