import dgram from 'dgram';

interface NTPTimestamp {
	integer: number;
	fraction: number;
	roundTripDelay: number;
}

/**
 * NTP 服务器
 * @param {string} Host NTP 服务器地址
 * @param {number} [Port=123] NTP 服务器端口
 *
 * @returns {Promise<NTPTimestamp>} 返回一个 Promise，解析为 NTP 时间戳对象
 * @throws {Error} 如果发生错误，则抛出异常
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const NTPServer = (Host: string, Port: number = 123): Promise<NTPTimestamp> => {
	return new Promise((resolve, reject) => {
		const client = dgram.createSocket('udp4'); // 创建一个 UDP 客户端

		const NTP_PACKET = Buffer.alloc(48); //一个 NTP 包的长度为 48 字节

		NTP_PACKET[0] = 0x1b; // 设置 NTP 协议版本，使用 v4 版协议

		const sendTime = process.hrtime(); // 记录请求发送时间

		client.send(NTP_PACKET, 0, NTP_PACKET.length, Port, Host, err => {
			if (err) {
				client.close();
				reject(err);
			}
		});

		client.on('message', msg => {
			/*
			 * NTP 时间戳的整数部分表示自 1900 年 1 月 1 日以来的秒数
			 * 小数部分表示秒的小数部分，通常精度为纳秒级别
			 */

			const receiveTime = process.hrtime(sendTime); // 计算接收时间与发送时间的差值
			const roundTripDelay = receiveTime[0] * 1e9 + receiveTime[1]; // 以纳秒为单位保存

			// 获取响应数据中的时间戳部分（从第 40 字节开始）
			const timestampInteger = msg.readUInt32BE(40); // NTP 时间戳的整数部分
			const timestampFraction = msg.readUInt32BE(44); // NTP 时间戳的小数部分

			// 关闭客户端连接
			client.close();

			// 返回 NTP 时间戳对象
			resolve({
				integer: timestampInteger,
				fraction: timestampFraction,
				roundTripDelay: roundTripDelay,
			});
		});

		client.on('error', err => {
			client.close();
			reject(err);
		});
	});
};

export default NTPServer;
