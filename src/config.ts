import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
	return {
		mongo: {
			dbName: process.env.MONGO_DB,
			user: process.env.MONGO_INITDB_ROOT_USERNAME,
			password: process.env.MONGO_INITDB_ROOT_PASSWORD,
			port: parseInt(process.env.MONGO_PORT, 10),
			host: process.env.MONGO_HOST,
			connection: process.env.MONGO_CONNECTION,
		},
		apiKey: process.env.API_KEY,
		baseUrl: process.env.BASE_URL,
		jwtSecret: process.env.JWT_SECRET,
		clientID: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET,
		redirectUri: process.env.REDIRECT_URI,
	};
});
