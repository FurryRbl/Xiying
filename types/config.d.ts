interface Config {
	time: {
		getMethod: string;

		ntp: {
			host: string;
			port: number;

			cache: boolean;
		};
	};
}

export default Config;
