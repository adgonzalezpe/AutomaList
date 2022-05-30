import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/models/roles.model';
import { CreateArtistDto, UpdateArtistDto } from '../dtos/artist.dto';
import { ArtistsService } from '../services/artists.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.CUSTOMER)
@Controller('artists')
export class ArtistsController {
	constructor(private artistService: ArtistsService) {}

	@Get()
	getAll() {
		const response = this.artistService.getAll();
		if(!response)
			throw new NotFoundException('Artists not found')
		return response;
	}

	@Get(':idArtistSpotify')
	getOne(@Param('idArtistSpotify') idArtistSpotify: string) {
		const response = this.artistService.getOne(idArtistSpotify);
		if(!response)
			throw new NotFoundException(`Artist with ID ${idArtistSpotify} not found`)
		return response;
	}

	@Get(':idArtistSpotify/songs')
	getSongsOfArtist(@Param('idArtistSpotify') idArtistSpotify: string) {
		const response = this.artistService.getSongsOfArtist(idArtistSpotify);
		if(!response)
			throw new NotFoundException(`Artist with ID ${idArtistSpotify} not found`)
		return response;
	}

	@Post()
	create(@Body() payload: CreateArtistDto) {
		const response = this.artistService.create(payload);
		if(!response)
			throw new BadRequestException(`Artist not created`)
		return response;
	}

	@Put()
	update(@Body() payload: UpdateArtistDto) {
		const response = this.artistService.update(payload);
		if(!response)
			throw new BadRequestException(`Artist not updated`)
		return response;
	}

	@Delete(':idArtistSpotify')
	remove(@Param('idArtistSpotify') idArtistSpotify: string) {
		const response = this.artistService.remove(idArtistSpotify);
		if(!response)
			throw new BadRequestException(`Artist not created`)
		return response;
	}
}
