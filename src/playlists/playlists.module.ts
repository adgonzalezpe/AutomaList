import { Module } from '@nestjs/common';
import { PlaylistService } from './services/playlist.service';
import { PlaylistController } from './controllers/playlist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Playlist, PlaylistSchema } from './schemas/playlist.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Playlist.name,
				schema: PlaylistSchema,
			}
		]),
	],
  providers: [PlaylistService],
  controllers: [PlaylistController],
  exports: [PlaylistService]
})
export class PlaylistsModule {}
