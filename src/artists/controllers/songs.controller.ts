import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/models/roles.model';
import { CreateSongDto, UpdateSongDto } from '../dtos/song.dto';
import { SongsService } from '../services/songs.service';

@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(Role.ADMIN, Role.CUSTOMER)
@Controller('songs')
export class SongsController {
	constructor(private songsService: SongsService) {}

	@Get()
	getAll() {
		const response = this.songsService.getAll();
		if(!response)
			throw new NotFoundException('Songs not found')
		return response;
	}

	@Get(':idSongSpotify')
	getOne(@Param('idSongSpotify') idSongSpotify: string) {
		const response = this.songsService.getOne(idSongSpotify);
		if(!response)
			throw new NotFoundException(`Song with ID ${idSongSpotify} not found`)
		return response;
	}

	@Post()
	create(@Body() payload: CreateSongDto) {
		const response = this.songsService.create(payload);
		if(!response)
			throw new BadRequestException(`Song not created`)
		return response;
	}

	@Put()
	update(@Body() payload: UpdateSongDto) {
		const response = this.songsService.update(payload);
		if(!response)
			throw new BadRequestException(`Song not updated`)
		return response;
	}

	@Delete(':idSongSpotify')
	remove(@Param('idSongSpotify') idSongSpotify: string) {
		const response = this.songsService.remove(idSongSpotify);
		if(!response)
			throw new BadRequestException(`Song not removed`)
		return response;
	}
}
