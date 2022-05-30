import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Song } from '../schemas/song.schema';
import { Model } from 'mongoose';
import { CreateSongDto, UpdateSongDto } from '../dtos/song.dto';
import { ArtistsService } from './artists.service';
import { Artist } from '../schemas/artist.schema';

@Injectable()
export class SongsService {
	constructor(
		@InjectModel(Song.name) private songModel: Model<Song>,
		private artistsService: ArtistsService,
	) {}

	async getAll() {
		const songs = await this.songModel
			.find()
			.populate({ path: 'artists', select: '-songs' })
			.exec();
		return songs;
	}

	async getOne(idSongSpotify: string) {
		let song = await this.songModel
			.findOne({ idSongSpotify: idSongSpotify })
			.populate({ path: 'artists', select: '-songs' })
			.exec();

		if (!song) return false;

		return song;
	}

	async create(data: CreateSongDto) {
		const songs = await this.songModel
			.findOne({
				idSongSpotify: data.idSongSpotify,
			})
			.exec();

		if (songs) return false;

		const song = await new this.songModel(data).save();

		return song;
	}

	async update(data: UpdateSongDto) {
		console.log(data);
		const song = await this.songModel
			.findOneAndUpdate(
				{ idSongSpotify: data.idSongSpotify },
				{ $set: data },
				{ new: true },
			)
			.exec();

		if (!song) return false;
		return song;
	}

	async remove(idSongSpotify: string) {
		const song = await this.songModel
			.findOneAndRemove({
				idSongSpotify: idSongSpotify,
			})
			.exec();

		if (!song) return false;
		return song;
	}

	async addArtistsToSong(idSongSpotify: string, artist: Artist) {
		const update = await this.songModel
			.findOneAndUpdate(
				{ idSongSpotify: idSongSpotify },
				{ $addToSet: { artists: artist } },
			)
			.exec();

		if (!update) return false;

		return await update.save();
	}
}
