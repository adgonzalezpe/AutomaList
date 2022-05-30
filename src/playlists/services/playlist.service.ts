import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Playlist, PlaylistDocument } from '../schemas/playlist.schema';
import { Model } from 'mongoose';
import { CreatePlaylistDto, UpdatePlaylistDto } from '../dtos/playlist.dto';
import { Song } from 'src/artists/schemas/song.schema';

@Injectable()
export class PlaylistService {
	constructor(
		@InjectModel(Playlist.name)
		private playlistModel: Model<PlaylistDocument>,
	) {}

	async getOne(idPlaylistSpotify: string) {
		const playlist = await this.playlistModel
			.find({ idPlaylistSpotify })
			.exec();

		if (!playlist)
			throw new NotFoundException(
				`Playlist with ID ${idPlaylistSpotify} not found`,
			);

		return playlist;
	}

	async create(data: CreatePlaylistDto) {
		const playlists = await this.playlistModel
			.findOne({ idPlaylistSpotify: data.idPlaylistSpotify })
			.exec();

		if (playlists)
			throw new BadRequestException(
				`Playlist with ID ${data.idPlaylistSpotify} created already.`,
			);

		const playlist = await new this.playlistModel(data).save();

		return playlist;
	}

	async update(idPlaylistSpotify: string, data: UpdatePlaylistDto) {
		const playlist = await this.playlistModel
			.findOneAndUpdate({ idPlaylistSpotify }, { data }, { new: true })
			.exec();

		if (!playlist)
			throw new NotFoundException(
				`Playlist with ID ${idPlaylistSpotify} not found`,
			);

		return playlist;
	}

	async remove(idPlaylistSpotify: string) {
		const playlist = await this.playlistModel.findOneAndRemove({
			idPlaylistSpotify,
		});

		if (!playlist)
			throw new NotFoundException(
				`Playlist with ID ${idPlaylistSpotify} not found`,
			);

		return playlist;
	}

	async addSongsToPlaylist(idPlaylistSpotify: string, songs: Song[]) {
		const update = await this.playlistModel
			.findOneAndUpdate(
				{ idPlaylistSpotify },
				{ $addToSet: { songs: songs } },
			)
			.exec();

		if (!update) return false;

		return await update.save();
	}

	async removeSongsToPlaylist(idPlaylistSpotify: string, songs: Song[]) {
		const update = await this.playlistModel
			.findOneAndUpdate({ idPlaylistSpotify }, { $pull: songs })
			.exec();

		if (!update) return false;

		return update;
	}
}
