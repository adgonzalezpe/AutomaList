import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { AxiosRequestHeaders } from 'axios';
import { Request, response } from 'express';
import { CreateArtistDto, UpdateArtistDto } from 'src/artists/dtos/artist.dto';
import { CreateSongDto } from 'src/artists/dtos/song.dto';
import { Artist } from 'src/artists/schemas/artist.schema';
import { Song } from 'src/artists/schemas/song.schema';
import { ArtistsService } from 'src/artists/services/artists.service';
import { SongsService } from 'src/artists/services/songs.service';
import { PayloadToken } from 'src/auth/models/token.model';
import config from 'src/config';
import { CreatePlaylistDto } from 'src/playlists/dtos/playlist.dto';
import { CreatePlaylistSpotifyDto } from 'src/playlists/dtos/playlistSpotify.dto';
import { PlaylistService } from 'src/playlists/services/playlist.service';
import { UsersService } from './user.service';

@Injectable()
export class SpotifyApiService {
	constructor(
		private artistsService: ArtistsService,
		private songsService: SongsService,
		private playlistsService: PlaylistService,
		@Inject(config.KEY) private configService: ConfigType<typeof config>,
	) {}

	private urlSpotify: string = 'https://api.spotify.com/v1/';
	private accessToken: string | boolean = false;
	private token: string = Buffer.from(
		this.configService.clientID + ':' + this.configService.clientSecret,
	).toString('base64');

	async requestAccessToken(refresh_token_spotify: string) {
		if (!refresh_token_spotify) {
			//Si es falso, pide un nuevo token propio, sino, devuelve el existente
			if (!this.accessToken) return await this.authorize();
			return {
				new_access_token: false,
				access_token_spotify: this.accessToken,
			};
		} else {
			//Pide un token a partir de un refreshtoken
			const headers: AxiosRequestHeaders = {
				Authorization: `Basic ${this.token}`,
				'Content-Type': `application/x-www-form-urlencoded`,
			};

			const data = new URLSearchParams();
			data.append('grant_type', 'refresh_token');
			data.append('refresh_token', refresh_token_spotify);

			const res = await axios.post(
				'https://accounts.spotify.com/api/token',
				data,
				{ headers },
			);

			if (res.data.access_token) {
				return {
					new_access_token: true,
					access_token_spotify: res.data.access_token,
				};
			}

			throw new BadRequestException('Request not valid.');
		}
	}

	async authorize(code?: string) {
		const headers: AxiosRequestHeaders = {
			Authorization: `Basic ${this.token}`,
			'Content-Type': `application/x-www-form-urlencoded`,
		};

		const data = new URLSearchParams();

		var new_token = false;

		//Si no tiene code, es porque no es un usuario logueandose
		if (!code) {
			data.append('grant_type', 'client_credentials');
		} else {
			new_token = true;
			data.append('code', code);
			data.append('redirect_uri', this.configService.redirectUri);
			data.append('grant_type', 'authorization_code');
		}

		try {
			const res = await axios.post(
				'https://accounts.spotify.com/api/token',
				data,
				{ headers },
			);

			if (new_token) {
				const access_token_spotify = res.data.access_token;
				const refresh_token_spotify = res.data.refresh_token;

				return {
					new_access_token: true,
					access_token_spotify,
					refresh_token_spotify,
				};
			} else {
				this.accessToken = res.data.access_token;
				return {
					new_access_token: false,
					access_token_spotify: this.accessToken,
				};
			}
		} catch (err) {
			return {
				ok: false,
			};
		}
	}

	//@Cron(CronExpression.EVERY_30_SECONDS)
	/*async getReleasesOfArtists() {
		const artists = (await this.artistsService.getAll()).data;

		if (artists.length > 0) {
			const results = await Promise.all(
				artists.map(async (artist) => {
					await new Promise(() => {
						setTimeout(() => console.log('Nueva busqueda'), 3000);
					});
					return await this.releaseSongs(artist.idArtistSpotify);
				}),
			);

			console.log(results);
		}
	}*/

	async accessTokenSpotify(request: Request) {
		var { access_token_spotify, refresh_token_spotify } = request.cookies;
		var new_access_token = false;
		var requestAccessToken;

		if (!access_token_spotify) {
			requestAccessToken = await this.requestAccessToken(
				refresh_token_spotify,
			);

			access_token_spotify = requestAccessToken.access_token_spotify;
			new_access_token = requestAccessToken.new_access_token;
		}

		return {
			access_token_spotify,
			new_access_token,
		};
	}

	async profile(request: Request) {
		const { access_token_spotify, new_access_token } =
			await this.accessTokenSpotify(request);

		try {
			const data = await axios.get(`${this.urlSpotify}me`, {
				headers: {
					Authorization: `Bearer ${access_token_spotify}`,
				},
			});

			return {
				access_token_spotify,
				profile: data.data,
				new_access_token,
			};
		} catch (err) {
			throw new BadRequestException(`Error.`);
		}
	}

	async createPlaylist(
		request: Request,
		idUserSpotify: string,
		playlist: CreatePlaylistSpotifyDto,
	) {
		const { access_token_spotify, new_access_token } =
			await this.accessTokenSpotify(request);

		const headers: AxiosRequestHeaders = {
			Authorization: `Bearer ${access_token_spotify}`,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		};

		if (!idUserSpotify)
			throw new UnauthorizedException(
				`You cant create playlists without login in Spotify first.`,
			);

		try {
			const createPlaylist = await axios.post(
				`${this.urlSpotify}users/${idUserSpotify}/playlists`,
				playlist,
				{
					headers: {
						Authorization: `Bearer ${access_token_spotify}`,
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
				},
			);

			return {
				access_token_spotify,
				playlist: createPlaylist.data,
				new_access_token,
			};
		} catch (err) {
			return err;
		}
	}

	async searchArtist(artist: string, request: Request) {
		const { access_token_spotify, new_access_token } =
			await this.accessTokenSpotify(request);

		try {
			const data = await axios.get(
				`${this.urlSpotify}search?q=${artist}&type=artist`,
				{
					headers: {
						Authorization: `Bearer ${access_token_spotify}`,
					},
				},
			);

			return {
				access_token_spotify,
				artist: data.data,
				new_access_token,
			};
		} catch (err) {
			throw new NotFoundException(
				`Artist with name '${artist}' not found`,
			);
		}
	}

	async searchSong(song: string, request: Request) {
		const { access_token_spotify, new_access_token } =
			await this.accessTokenSpotify(request);

		try {
			const data = await axios.get(
				`${this.urlSpotify}search?q=${song}&type=track`,
				{
					headers: {
						Authorization: `Bearer ${access_token_spotify}`,
					},
				},
			);

			return {
				access_token_spotify,
				song: data.data,
				new_access_token,
			};
		} catch (err) {
			throw new NotFoundException(`Song with name '${song}' not found`);
		}
	}

	async getArtistById(idArtistSpotify: string, request: Request) {
		const { access_token_spotify, new_access_token } =
			await this.accessTokenSpotify(request);

		try {
			const artist = await this.artistsService.getOne(idArtistSpotify);

			if (!artist) {
				const data = await axios.get(
					`${this.urlSpotify}artists/${idArtistSpotify}`,
					{
						headers: {
							Authorization: `Bearer ${access_token_spotify}`,
						},
					},
				);
				const newArtist: CreateArtistDto = {
					name: data.data.name,
					idArtistSpotify: data.data.id,
					lastSearch: null,
					imageUrl: data.data.images[0].url,
					songs: [],
				};

				const artistAdded = await this.artistsService.create(newArtist);

				return {
					access_token_spotify,
					artist: artistAdded,
					new_access_token,
				};
			} else {
				return {
					access_token_spotify,
					artist,
					new_access_token,
				};
			}
		} catch (err) {
			throw new NotFoundException(
				`Artist with ID "${idArtistSpotify}" not found`,
			);
		}
	}

	async getSongById(idSongSpotify: string, request: Request) {
		const { access_token_spotify, new_access_token } =
			await this.accessTokenSpotify(request);

		try {
			const data = await axios.get(
				`${this.urlSpotify}tracks/${idSongSpotify}`,
				{
					headers: {
						Authorization: `Bearer ${access_token_spotify}`,
					},
				},
			);
			return {
				access_token_spotify,
				song: data.data,
				new_access_token,
			};
		} catch (err) {
			throw new NotFoundException(
				`Song with ID "${idSongSpotify}" not found`,
			);
		}
	}

	async getAlbumsFromArtist(
		idArtistSpotify: string,
		access_token_spotify: string,
	) {
		try {
			const albums = await axios.get(
				`${this.urlSpotify}artists/${idArtistSpotify}/albums?include_groups=album,single&limit=50`,
				{
					headers: {
						Authorization: `Bearer ${access_token_spotify}`,
					},
				},
			);

			return {
				albums: albums.data,
			};
		} catch (err) {
			throw new NotFoundException(
				`Albums with artist ID "${idArtistSpotify}" not found`,
			);
		}
	}

	async getInfoOfAlbums(albums: [], access_token_spotify: string) {
		var ids: string = '';

		albums.forEach((album) => (ids = `${ids}${album['idAlbumSpotify']},`));

		ids = ids.slice(0, -1);

		try {
			const tracks = await axios.get(
				`${this.urlSpotify}albums?ids=${ids}`,
				{
					headers: {
						Authorization: `Bearer ${access_token_spotify}`,
					},
				},
			);

			return { value: true, data: tracks.data };
		} catch (err) {
			return { value: false, data: err };
		}
	}

	async releaseSongs(idArtistSpotify: string, request: Request) {
		const artist = await this.artistsService.getOne(idArtistSpotify);
		var update: boolean = false;

		if (artist) {
			update = false;
			const date = new Date();
			const dateArtist = new Date(artist.lastSearch);

			const diffTime = date.getTime() - dateArtist.getTime();

			const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays > 1) {
				update = true;
			}
		} else {
			update = true;
		}

		if (update) {
			const { access_token_spotify, new_access_token } =
				await this.accessTokenSpotify(request);

			var { albums } = await this.getAlbumsFromArtist(
				idArtistSpotify,
				access_token_spotify,
			);

			if (!albums) return { update: false };

			albums = this.albumsAndSinglesArray(albums);

			if (!albums) return { update: false };

			albums = await this.getInfoOfAlbums(albums, access_token_spotify);

			if (!albums.value) {
				return { update: false };
			}

			try {
				for (const album of albums.data.albums) {
					for (const track of album.tracks.items) {
						const songsOfArtist =
							await this.artistsService.getSongsOfArtist(
								idArtistSpotify,
							);

						var result = [];

						if (songsOfArtist) {
							result = songsOfArtist.filter(
								(songOfArtist) =>
									songOfArtist.name === track.name,
							);
						}
						if (!songsOfArtist || result.length === 0) {
							const songs: Song[] = [];
							const artists: Artist[] = [];

							const dataSong = await this.songsService.getOne(
								track.id,
							);
							if (!dataSong) {
								const newSong: CreateSongDto = {
									name: track.name,
									idSongSpotify: track.id,
									releaseDate: album.release_date,
									artists: [],
									imageUrl: album.images[0].url,
								};
								const songAdded =
									await this.songsService.create(newSong);

								if (songAdded) songs.push(songAdded);

								for (const artist of track.artists) {
									const dataArtist =
										await this.artistsService.getOne(
											artist.id,
										);

									if (!dataArtist) {
										const newArtist: CreateArtistDto = {
											name: artist.name,
											idArtistSpotify: artist.id,
											lastSearch: null,
											songs: [],
											imageUrl: '',
										};

										const artistAdded =
											await this.artistsService.create(
												newArtist,
											);

										if (artistAdded)
											artists.push(artistAdded);
									} else {
										artists.push(dataArtist);
									}
								}

								artists.map(async (artist) => {
									if (
										artist.idArtistSpotify ===
										idArtistSpotify
									) {
										const artistUpdate: UpdateArtistDto = {
											name: artist.name,
											idArtistSpotify:
												artist.idArtistSpotify,
											lastSearch: new Date(),
										};

										await this.artistsService.update(
											artistUpdate,
										);
									}

									await this.artistsService.addSongsToArtist(
										artist.idArtistSpotify,
										songs[0],
									);

									await this.songsService.addArtistsToSong(
										songs[0].idSongSpotify,
										artist,
									);
								});
							}
						}
					}
				}

				return {
					update: true,
					artist: await this.artistsService.getOne(idArtistSpotify),
					access_token_spotify,
					new_access_token,
				};
			} catch (err) {
				return {
					update: false,
					access_token_spotify,
					new_access_token,
				};
			}
		} else {
			return {
				update: false,
				artist: artist,
			};
		}
	}

	albumsAndSinglesArray(albums: any) {
		var date = new Date();

		date.setMonth(date.getMonth() - 6);

		var limitDate = date.toISOString().split('T')[0];

		albums = albums.items.filter((album) => {
			return album.release_date >= limitDate;
		});

		if (albums.length > 0) {
			albums = albums.map((album) => {
				return {
					idAlbumSpotify: album.id,
					release_date: new Date(album.release_date),
				};
			});

			albums = albums.sort(
				(albumA, albumB) =>
					albumB.release_date.getTime() -
					albumA.release_date.getTime(),
			);

			return albums;
		}

		return false;
	}

	async addSongsToPlaylist(
		artists: Artist[],
		idPlaylistSpotify: string,
		request?: Request,
	) {
		const { access_token_spotify, new_access_token } =
			await this.accessTokenSpotify(request);

		var songs: string[] = [];

		for (const artist of artists) {
			const songsOfArtist = await this.artistsService.getSongsOfArtist(
				artist.idArtistSpotify,
			);

			if (songsOfArtist)
				for (const song of songsOfArtist) {
					songs.push(song.idSongSpotify);
				}
		}

		var uriSongs = songs.map((song) => `spotify:track:${song}`);

		try {
			const data = await axios.post(
				`${this.urlSpotify}playlists/${idPlaylistSpotify}/tracks`,
				{uris: uriSongs},
				{
					headers: {
						Authorization: `Bearer ${access_token_spotify}`,
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
				},
			);
			return {
				access_token_spotify,
				song: data.data,
				new_access_token,
			};

		} catch (err) {
			console.log(err)
			throw new NotFoundException(
				`Playlist with ID "${idPlaylistSpotify}" not found`,
			);
		}
	}
}
