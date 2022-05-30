import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isMongoId } from 'class-validator';
import { Model } from 'mongoose';
import { Artist } from 'src/artists/schemas/artist.schema';
import { ArtistsService } from 'src/artists/services/artists.service';
import { SongsService } from 'src/artists/services/songs.service';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { SpotifyApiService } from './spotify-api.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { PlaylistService } from 'src/playlists/services/playlist.service';
import { CreatePlaylistSpotifyDto } from 'src/playlists/dtos/playlistSpotify.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private spotifyApiService: SpotifyApiService,
		private artistsService: ArtistsService,
		private songsService: SongsService,
		private playlistsService: PlaylistService,
	) {}

	async getAll() {
		return await this.userModel.find().populate('artists playlists').exec();
	}

	async getOne(id: string) {
		if (!isMongoId(id))
			throw new BadRequestException(`User with ID ${id} is not valid`);
		const user = await this.userModel
			.findById(id)
			.populate({ path: 'artists' })
			.exec();
		if (!user) throw new NotFoundException(`User with ID ${id} not found`);
		return user;
	}

	async getUsername(username: string) {
		const user = await this.userModel
			.findOne({ username })
			.collation({ locale: 'es', strength: 2 })
			.populate({ path: 'artists playlists' })
			.exec();
		if (!user)
			throw new NotFoundException(
				`User with username ${username} not found`,
			);
		return user;
	}

	async login(email: string) {
		return this.userModel
			.findOne({ email })
			.select('+password +email')
			.exec();
	}

	async create(data: CreateUserDto) {
		const users = await this.userModel
			.findOne({ username: data.username, email: data.email })
			.exec();
		if (users)
			throw new BadRequestException(
				`User with username ${data.username} created already.`,
			);

		const user = await new this.userModel(data);
		const hashPassword = await bcrypt.hash(user.password, 10);
		user.password = hashPassword;
		const model = await user.save();
		const { password, ...rta } = model.toJSON();
		return rta;
	}

	async update(username: string, data: UpdateUserDto) {
		const user = await this.userModel
			.findOneAndUpdate({ username }, data, { new: true })
			.exec();
		if (!user)
			throw new NotFoundException(
				`User with username ${username} not found`,
			);
		return user;
	}

	async profile(username: string, request: Request) {
		const profile = await this.spotifyApiService.profile(request);

		const user = await this.update(username, {
			idUserSpotify: profile.profile.id,
		});

		return {
			profile,
			user,
		};
	}

	async remove(username: string) {
		const user = await this.userModel.findOneAndRemove({ username });
		if (!user)
			throw new NotFoundException(
				`User with username ${username} not found`,
			);
		return user;
	}

	async addArtistToUser(username: string, idArtistSpotify: string) {
		const artist = await this.artistsService.getOne(idArtistSpotify);

		if (!artist) return false;

		const user = await this.userModel.findOneAndUpdate(
			{ username },
			{ $addToSet: { artists: artist } },
			{ new: true },
		);

		if (!user) return false;

		return await user.save();
	}

	async removeArtistToUser(username: string, idArtistSpotify: string) {
		const artist = await this.artistsService.getOne(idArtistSpotify);

		if (!artist) return false;

		const user = await this.userModel.findOne({ username });
		user.artists = user.artists.filter((artist) => artist !== artist);

		return await user.save();
	}

	async addSongToUser(username: string, idSongSpotify: string) {
		const song = await this.songsService.getOne(idSongSpotify);

		if (!song) return false;

		const user = await this.userModel.findOneAndUpdate(
			{ username },
			{
				$addToSet: { songs: song },
			},
		);

		if (!user) return false;

		return await user.save();
	}

	async removeSongToUser(username: string, idSongSpotify: string) {
		const artist = await this.songsService.getOne(idSongSpotify);

		if (!artist) return false;

		const user = await this.userModel.findOne({ username });
		user.artists = user.artists.filter((song) => song !== song);

		return await user.save();
	}

	async createPlaylistToUser(
		username: string,
		request: Request,
		playlistSpotify: CreatePlaylistSpotifyDto,
	) {
		const user = await this.userModel.findOne({ username }).exec();

		if (!user) return false;

		if (!user.idUserSpotify)
			throw new UnauthorizedException(`You need login in Spotify`);

		const { access_token_spotify, new_access_token, playlist } =
			await this.spotifyApiService.createPlaylist(
				request,
				user.idUserSpotify,
				playlistSpotify,
			);

		if (!playlist) return false;

		const playlistService = await this.playlistsService.create({
			name: playlistSpotify.name,
			idUserSpotify: user.idUserSpotify,
			idPlaylistSpotify: playlist.id,
			songs: [],
		});

		if (!playlistService) return false;

		const add = await this.addPlaylistToUser(
			username,
			playlistService.idPlaylistSpotify,
		);

		if (!add) return false;

		return {
			access_token_spotify,
			new_access_token,
			playlist: playlistService,
		};
	}

	async addPlaylistToUser(username: string, idPlaylistSpotify: string) {
		const playlist = await this.playlistsService.getOne(idPlaylistSpotify);

		if (!playlist) return false;

		const user = await this.userModel.findOneAndUpdate(
			{ username },
			{
				$addToSet: { playlists: playlist },
			},
		);

		if (!user) return false;

		return await user.save();
	}

	async removePlaylistToUser(username: string, idPlaylistSpotify: string) {
		const playlist = await this.playlistsService.getOne(idPlaylistSpotify);

		if (!playlist) return false;

		const user = await this.userModel.findOne({ username });
		user.playlists = user.playlists.filter(
			(playlist) => playlist !== playlist,
		);

		return await user.save();
	}

	async addSongsToPlaylist(username: string, idPlaylistSpotify: string, request: Request) {
		const user = await this.userModel.findOne({username}).populate('artists').exec();

		if(!user)
			return false;

		if(!user.idUserSpotify)
			throw new UnauthorizedException('You need login on Spotify');

		return await this.spotifyApiService.addSongsToPlaylist(user.artists, idPlaylistSpotify, request);
	}
}
