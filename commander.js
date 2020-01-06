'use strict';

const fs = require('fs');
const path = require('path');

module.exports = (cmdPath) => {
    const program = require('commander');
    const fls = fs.readdirSync(cmdPath);
    for (let fl of fls) {
        if (fl.slice(-3) !== '.js') continue;
        let cmdInit = require(path.join(cmdPath, fl));
        cmdInit(program);
    }

    program
    .command('*') //异常参数
    .description('非法指令提示')
    .action(function () {
        program.help();
    });
    program.parse(process.argv);
};