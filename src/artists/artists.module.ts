import { Module } from '@nestjs/common';
import { ArtistsController } from './controllers/artists.controller';
import { SongsController } from './controllers/songs.controller';
import { SongsService } from './services/songs.service';
import { ArtistsService } from './services/artists.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Artist, ArtistSchema } from './schemas/artist.schema';
import { Song, SongSchema } from './schemas/song.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Artist.name,
				schema: ArtistSchema,
			},
			{
				name: Song.name,
				schema: SongSchema,
			},
		]),
	],
	controllers: [ArtistsController, SongsController],
	providers: [SongsService, ArtistsService],
	exports: [SongsService, ArtistsService],
})
export class ArtistsModule {}
