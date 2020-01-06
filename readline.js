'use strict';

class Readline {
    constructor() {
        this.rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }
    ask(v) {
        return new Promise((rs) => {
            this.rl.question(v, rs);
        });
    }
    end() {
        this.rl.close();
    }
}

module.exports = Readline;