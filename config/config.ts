import type Config from '../types/config.js';

export default {
	time: {
		getMethod: 'ntp',

		ntp: {
			host: 'ntp.ntsc.ac.cn',
			port: 123,

			cache: true,
		},
	},
} satisfies Config;
