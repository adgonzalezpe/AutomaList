import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { Request, response, Response } from 'express';
import { Artist } from 'src/artists/schemas/artist.schema';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/models/roles.model';
import { PayloadToken } from 'src/auth/models/token.model';
import { CreatePlaylistSpotifyDto } from 'src/playlists/dtos/playlistSpotify.dto';
import { CreateUserDto, DeleteUserDto, UpdateUserDto } from '../dtos/user.dto';
import { UsersService } from '../services/user.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Roles(Role.ADMIN)
	@Get()
	getAll() {
		return this.usersService.getAll();
	}

	@Roles(Role.ADMIN, Role.CUSTOMER)
	@Get('/me/')
	async user(@Req() request: Request){
		const userToken = request.user as PayloadToken;
		const user = await this.usersService.getUsername(userToken.sub);

		return user;
	}

	@Roles(Role.ADMIN)
	@Get(':data')
	getOne(@Param('data') data: string) {
		if (!isMongoId(data)) {
			return this.usersService.getUsername(data);
		} else {
			return this.usersService.getOne(data);
		}
	}

	@Roles(Role.CUSTOMER, Role.ADMIN)
	@Post('profile')
	async profileUser(@Req() request: Request, @Res({passthrough: true}) response: Response){
		const user = request.user as PayloadToken;
		const profile = await this.usersService.profile(user.sub, request);

		if (profile.profile.new_access_token) {
			response.cookie('access_token_spotify', profile.profile.access_token_spotify, {
				maxAge: 3600000,
			})
		}

		return profile.user;
	}

	@Post()
	@Public()
	create(@Body() payload: CreateUserDto) {
		return this.usersService.create(payload);
	}

	@Roles(Role.CUSTOMER, Role.ADMIN)
	@Post('playlist')
	async createPlaylistToUser(@Req() request: Request, @Body() payload: CreatePlaylistSpotifyDto, @Res({passthrough: true}) response: Response){
		const user = request.user as PayloadToken;

		const playlist = await this.usersService.createPlaylistToUser(user.sub, request, payload);

		if(!playlist) throw new UnauthorizedException(`Error`)

		if (playlist.new_access_token) {
			response.cookie('access_token_spotify', playlist.access_token_spotify, {
				maxAge: 3600000,
			})
		}

		return playlist.playlist;
	}

	@Roles(Role.CUSTOMER, Role.ADMIN)
	@Post('playlist/:idPlaylistSpotify')
	async addSongsToPlaylist(@Req() request: Request, @Param('idPlaylistSpotify') idPlaylistSpotify: string, @Res({passthrough: true}) response: Response) {
		const user = request.user as PayloadToken;

		return await this.usersService.addSongsToPlaylist(user.sub, idPlaylistSpotify, request);
	} 

	@Roles(Role.CUSTOMER, Role.ADMIN)
	@Put('playlist/:idPlaylistSpotify')
	addPlaylistToUser(
		@Req() request: Request,
		@Param('idPlaylistSpotify') idPlaylistSpotify: string,
	) {
		const user = request.user as PayloadToken;
		return this.usersService.addPlaylistToUser(user.sub, idPlaylistSpotify);
	}

	@Roles(Role.CUSTOMER, Role.ADMIN)
	@Delete('playlist/:idPlaylistSpotify')
	removePlaylistToUSer(
		@Req() request: Request,
		@Param('idPlaylistSpotify') idPlaylistSpotify: string,
	) {
		const user = request.user as PayloadToken;
		return this.usersService.removePlaylistToUser(user.sub, idPlaylistSpotify);
	}


	@Roles(Role.CUSTOMER, Role.ADMIN)
	@Put()
	update(@Req() request: Request, @Body() payload: UpdateUserDto) {
		const user = request.user as PayloadToken;
		if(user.role === Role.CUSTOMER)
			var {role, ...data} = payload;
		return this.usersService.update(user.sub, data);
	}

	@Roles(Role.ADMIN)
	@Put('update')
	updateUser(@Body() payload: UpdateUserDto) {
		return this.usersService.update(payload.username, payload);
	}

	@Roles(Role.CUSTOMER, Role.ADMIN)
	@Put('artist/:idArtistSpotify')
	addArtistToUser(
		@Req() request: Request,
		@Param('idArtistSpotify') idArtistSpotify: string,
	) {
		const user = request.user as PayloadToken;
		return this.usersService.addArtistToUser(user.sub, idArtistSpotify);
	}

	@Roles(Role.CUSTOMER, Role.ADMIN)
	@Delete('artist/:idArtistSpotify')
	removeArtistToUser(
		@Req() request: Request,
		@Param('idArtistSpotify') idArtistSpotify: string,
	) {
		const user = request.user as PayloadToken;
		return this.usersService.removeArtistToUser(user.sub, idArtistSpotify);
	}

	@Roles(Role.CUSTOMER, Role.ADMIN)
	@Put('song/:idArtistSpotify')
	addSongToUser(
		@Req() request: Request,
		@Param('idSongSpotify') idSongSpotify: string,
	) {
		const user = request.user as PayloadToken;
		return this.usersService.addSongToUser(user.sub, idSongSpotify);
	}

	@Roles(Role.CUSTOMER, Role.ADMIN)
	@Delete('song/:idSongSpotify')
	removeSongToUser(
		@Req() request: Request,
		@Param('idSongSpotify') idSongSpotify: string,
	) {
		const user = request.user as PayloadToken;
		return this.usersService.removeArtistToUser(user.sub, idSongSpotify);
	}

	@Roles(Role.CUSTOMER, Role.ADMIN)
	@Delete()
	remove(@Req() request: Request) {
		const user = request.user as PayloadToken;
		return this.usersService.remove(user.sub);
	}

	@Roles(Role.ADMIN)
	@Delete('remove')
	removeUser(@Req() request: Request, @Body() payload: DeleteUserDto) {
		return this.usersService.remove(payload.username)
	}
}
