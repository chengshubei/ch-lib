'use strict';

class RabbitMQ {
    constructor(config) {
        this.protocol = config.tls ? 'amqps' : 'amqp';
        this.host = config.host || 'localhost';
        this.port = config.port || config.tls ? 5672 : 5671;
        this.username = config.username || '';
        this.password = config.password || '';
        this.vhost = config.vhost || '/'; //隔离空间(默认: '/', 每一个vhost就是一个小的独立的rabbitmq机器)
        this.locale = config.locale || 'en_US'; //语言(默认: en_US, 建议不修改)
        this.frameMax = config.frameMax || 0; //最大帧长度(默认:0, 无限制, 单位字节)
        this.channelMax = config.channelMax || 0; //最大信道数(默认:0, 无限制)
        this.heartbeat = config.heartbeat || 60; //心跳检测时间(默认:0)
        this.connection_name = config.name || 'node_app'; //设置连接名
        this.reset_max = config.reconnectMax || 20; //短时间最大重连次数
        this.conncetion = null;
        this.reset_time = 0; //当前重连次数
        this.last_reset_time = 0; //上次重连时间戳

        //channel存储
        this.channelMap = {};
    }

    /**
     * 建立RabbitMQ连接
     * @param {Function}    init                rabbitmq初始化函数
     * @param {Function}    options.errorCb     连接错误处理
     * @param {Function}    options.closeCb     连接关闭处理   
     */
    async createConnection(init, options = {}) {
        const amqp = require('amqplib');
        const moment = require('moment');

        if (arguments.length === 1 && typeof init === 'object') {
            options = init;
            init = null;
        }
        this.conncetion = await amqp.connect({
            protocol: this.protocol,
            hostname: this.host,
            port: this.port,
            username: this.username,
            password: this.password,
            vhost: this.vhost
        }, {
            clientProperties: {
                connection_name: this.connection_name
            }
        });

        if (init) await init(this);
        this.last_reset_time = moment().unix();

        //重连机制
        this.conncetion.on('error', async (err) => {
            console.error('rabbitMQ 连接错误： ' + err.message);
            console.error(err);
            if (options.errorCb) options.errorCb(err);

            try {
                await this.conncetion.close();
            } catch (error) {
                console.warn('MQ原连接关闭失败: ' + error.message);
            }

            //设置重连
            let now = moment().unix();
            if (now - this.last_reset_time > 300) {
                this.last_reset_time = now;
                this.reset_time = 0;
                await this.createConnection(init, options);
            } else if (this.reset_time < this.reset_max) {
                this.last_reset_time = now;
                this.reset_time ++;
                await this.createConnection(init, options);
            } else {
                throw new Error('RabbitMQ 重连异常: ' + err.message);
            }
        });
        this.conncetion.on('close', async () => {
            console.warn('rabbitMQ 连接关闭');
            if (options.closeCb) options.closeCb();
        });

        return this.conncetion;
    }

    /**
     * 获取新的信道
     * @param {String}      name                信道标识
     * @param {Boolean}     options.confirm     如果设置将创建需要确认的信道
     * @param {Number}      options.prefetch    如果设置, 则限制每次接收的消息数量
     * @param {Function}    options.errorCb     信道错误处理
     * @param {Function}    options.closeCb     信道关闭处理
     */
    async getChannel(name, options = {}) {
        if (this.channelMap[name]) return this.channelMap[name];

        let chan = null;
        if (options.confirm) chan = await this.conncetion.createConfirmChannel();
        else chan = await this.conncetion.createChannel();
        chan.on('error', err => {
            console.error(`信道${name}发现错误: ${err.message}`);
            if (options.errorCb) options.errorCb(err);
        });
        chan.on('close', () => {
            console.warn(`信道${name}关闭`);
            if (options.closeCb) options.closeCb();
        });

        if (Number(options.prefetch)) await chan.prefetch(options.prefetch);
        this.channelMap[name] = chan;
        return chan;
    }

    /**
     * 关闭RabbitMQ连接
     */
    async close() {
        let tasks = [];
        for (let chName in this.channelMap) {
            tasks.push(this.channelMap[chName].close());
        }
        if (tasks.length > 0) await Promise.all(tasks);
        await this.conncetion.close();
    }
}

module.exports = RabbitMQ;