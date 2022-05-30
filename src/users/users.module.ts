import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './controllers/user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './services/user.service';
import { SpotifyApiService } from './services/spotify-api.service';
import { SpotifyApiController } from './controllers/spotify-api.controller';

import { ArtistsModule } from 'src/artists/artists.module';
import { PlaylistsModule } from 'src/playlists/playlists.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
		ArtistsModule,
		PlaylistsModule
	],
	controllers: [UsersController, SpotifyApiController],
	providers: [UsersService, SpotifyApiService],
	exports: [UsersService, SpotifyApiService],
})
export class UsersModule {}
