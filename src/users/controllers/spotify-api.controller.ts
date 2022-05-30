import {
	Controller,
	Get,
	Inject,
	Param,
	Query,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Request, response, Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import config from 'src/config';
import { SCOPES } from '../decorators/scopes.decorator';
import { SpotifyApiService } from '../services/spotify-api.service';

@UseGuards(JwtAuthGuard)
@Controller('spotifyApi')
export class SpotifyApiController {
	constructor(
		private spotifyApiService: SpotifyApiService,
		@Inject(config.KEY) private configService: ConfigType<typeof config>,
	) {}

	@Get('login')
	@Public()
	login(@Res() response: Response) {
		response.redirect(
			`https://accounts.spotify.com/authorize?response_type=code&client_id=${this.configService.clientID}&scope=${SCOPES}&redirect_uri=${this.configService.redirectUri}&show_dialog=false`,
		);
	}

	@Get('callback')
	@Public()
	async callback(
		@Query() query: { code: string; error: string },
		@Res({ passthrough: true }) response: Response,
	) {
		if (!query.error && query.code) {
			const data = await this.spotifyApiService.authorize(query.code);

			if (data.new_access_token) {
				response.cookie(
					'access_token_spotify',
					data.access_token_spotify,
					{ maxAge: 3600000 },
				);
				response.cookie(
					'refresh_token_spotify',
					data.refresh_token_spotify,
				);
			}

			return data.new_access_token;
		}
		throw new UnauthorizedException(`Request not authorized`);
	}

	@Public()
	@Get('searchArtist/:artist')
	async searchArtist(
		@Param('artist') artist: string,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const data = await this.spotifyApiService.searchArtist(artist, request);

		if (data.new_access_token) {
			response.cookie('access_token_spotify', data.access_token_spotify, {
				maxAge: 3600000,
			});
		}

		return data.artist;
	}

	@Public()
	@Get('searchSong/:song')
	async searchSong(
		@Param('song') song: string,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const data = await this.spotifyApiService.searchSong(song, request);

		if (data.new_access_token) {
			response.cookie('access_token_spotify', data.access_token_spotify, {
				maxAge: 3600000,
			});
		}

		return data.song;
	}

	@Public()
	@Get('getArtistById/:idArtistSpotify')
	async getArtistById(
		@Param('idArtistSpotify') idArtistSpotify: string,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const data = await this.spotifyApiService.getArtistById(
			idArtistSpotify,
			request,
		);

		if (data.new_access_token) {
			response.cookie('access_token_spotify', data.access_token_spotify, {
				maxAge: 3600000,
			});
		}

		return data.artist;
	}

	@Public()
	@Get('releaseSongs/:idArtistSpotify')
	async releaseSong(
		@Param('idArtistSpotify') idArtistSpotify: string,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const release = await this.spotifyApiService.releaseSongs(
			idArtistSpotify,
			request,
		);

		if (release.new_access_token) {
			response.cookie(
				'access_token_spotify',
				release.access_token_spotify,
				{
					maxAge: 3600000,
				},
			);
		}

		return release;
	}
}
