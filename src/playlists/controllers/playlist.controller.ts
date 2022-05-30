import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/models/roles.model';
import { PlaylistService } from 'src/playlists/services/playlist.service';
import { CreatePlaylistDto, UpdatePlaylistDto } from '../dtos/playlist.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.CUSTOMER)
@Controller('playlists')
export class PlaylistController {
	private playlistService: PlaylistService;

	@Get(':idPlaylistSpotify')
	getOne(@Param('idPlaylistSpotify') idPlaylistSpotify: string){
		return this.playlistService.getOne(idPlaylistSpotify);
	}

	@Post()
	create(@Body() payload: CreatePlaylistDto) {
		return this.playlistService.create(payload);
	}
	
	@Put(':idPlaylistSpotify')
	update(@Param('idPlaylistSpotify') idPlaylistSpotify: string, @Body() payload: UpdatePlaylistDto) {
		return this.playlistService.update(idPlaylistSpotify, payload);
	}

	@Delete(':idPlaylistSpotify')
	remove(@Param('idPlaylistSpotify') idPlaylistSpotify: string){
		return this.playlistService.remove(idPlaylistSpotify);
	}
}
