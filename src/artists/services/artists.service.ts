import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist } from '../schemas/artist.schema';
import { Model } from 'mongoose';
import { CreateArtistDto, UpdateArtistDto } from '../dtos/artist.dto';
import { Song } from '../schemas/song.schema';

@Injectable()
export class ArtistsService {
	constructor(@InjectModel(Artist.name) private artistModel: Model<Artist>) {}

	async getAll() {
		const artists = await this.artistModel
			.find()
			.populate({ path: 'songs', select: ' -artists' })
			.exec();
		
		if(artists)
			return {
				value: true,
				items: artists.length,
				data: artists,
			};
		return {
			value: false,
			items: 0,
		};
	}

	async getOne(idArtistSpotify: string) {
		const artist: Artist = await this.artistModel
			.findOne({ idArtistSpotify: idArtistSpotify })
			.populate({ path: 'songs', select: ' -artists' })
			.exec();

		if (!artist) return false;

		return artist;
	}

	async create(data: CreateArtistDto) {
		try {
			const artist = await new this.artistModel(data).save();
			return artist;
		} catch (err) {
			return err;
		}
	}

	async update(data: UpdateArtistDto) {
		const artist = await this.artistModel
			.findOneAndUpdate(
				{ idArtistSpotify: data.idArtistSpotify },
				{ $set: data },
				{ new: true },
			)
			.exec();

		if (!artist)
			throw new NotFoundException(
				`Artist with ID ${data.idArtistSpotify} not found`,
			);
		return artist;
	}

	async remove(idArtistSpotify: string) {
		const artist = await this.artistModel
			.findOneAndRemove({
				idArtistSpotify: idArtistSpotify,
			})
			.exec();

		if (!artist)
			throw new NotFoundException(
				`Artist with ID ${idArtistSpotify} not found`,
			);
		return artist;
	}

	async getSongsOfArtist(idArtistSpotify: string) {
		const artist = await this.artistModel
			.findOne({ idArtistSpotify: idArtistSpotify })
			.populate('songs')
			.exec();

		if (!artist) return false;

		return artist.songs;
	}

	async addSongsToArtist(idArtistSpotify: string, song: Song) {
		const artist = await this.artistModel
			.findOne({
				idArtistSpotify: idArtistSpotify,
			})
			.exec();

		if (!artist) return false;

		const update = await this.artistModel
			.findOneAndUpdate(
				{ idArtistSpotify: idArtistSpotify },
				{ $addToSet: { songs: song } },
			)
			.exec();

		if (!update) return false;

		return await update.save();
	}
}
