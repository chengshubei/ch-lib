
# ch-lib

一些常用的模块封装和辅助函数。

## Installation

```
$ npm install ch-lib
```


## Example

Always pretty by default:

```js
const {mysql} = require('ch-lib/mysql');
const Mysql = mysql({
    host: '172.16.0.155',
    database: 'mine',
    username: 'me',
    password: 'ddddddd',
    max_connection: 20,
    min_connection: 1,
    logger: false
});
```

## 提示

    1. 本模块没有指定依赖, 使用者应自己 npm install --save
    2. 本模块内的配置和函数会不定期的去适配依赖模块的最新版本, 极少的情况下可能出现依赖的模块新版本与旧版本不兼容。
        跟踪最新版本, 通常会带来性能和体验的优化, 但是也可能导致本地模块使用出错的情况, 所以正式环境上线前, 请确保测试环境正常。
        为了比较好的避免出现这个糟糕的情况, 决定: 只要出现不兼容的依赖版本, 本ch-lib模块更新后也将升级一个大的版本号,
        (eg: 1.5.8 -> 2.0.0), 以尽量保证使用者package.json中的模块能够配套。
    3. 使用中的任何问题和建议都可以提交issue或联系我, 1246691129@qq.com。
    4. 因为模块多是些简单实用的封装和函数集合, 所以没有提供详细的文档, 请npm install后查看源码, 确定合适再使用.

# License

  MIT
