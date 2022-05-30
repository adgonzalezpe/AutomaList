import { PartialType } from '@nestjs/mapped-types';
import {
	IsArray,
	IsDate,
	IsEmpty,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
} from 'class-validator';
import { Song } from '../schemas/song.schema';

export class CreateArtistDto {
	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@IsNotEmpty()
	@IsString()
	readonly idArtistSpotify: string;

	@IsDate()
	@IsOptional()
	readonly lastSearch: Date | null;

	@IsString()
	@IsUrl()
	@IsOptional()
	readonly imageUrl: string;	

	@IsArray()
	@IsOptional()
	readonly songs: Song[];
}

export class UpdateArtistDto extends PartialType(CreateArtistDto) {}
