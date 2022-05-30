import { Module, HttpModule, HttpService } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { enviroments } from './enviroments';
import { PlaylistsModule } from './playlists/playlists.module';
import { ArtistsModule } from './artists/artists.module';
import config from './config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: enviroments[process.env.NODE_ENV] || '.env',
			load: [config],
			isGlobal: true,
			validationSchema: Joi.object({
				API_KEY: Joi.string().required(),
				DATABASE_NAME: Joi.string().required(),
				DATABASE_PORT: Joi.number().required(),
				JWT_SECRET: Joi.string().required(),
				CLIENT_ID: Joi.string().required(),
				CLIENT_SECRET: Joi.string().required(),
				REDIRECT_URI: Joi.string().required()
			}),
		}),
		UsersModule,
		DatabaseModule,
		PlaylistsModule,
		ArtistsModule,
		AuthModule,
		ScheduleModule.forRoot(),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
