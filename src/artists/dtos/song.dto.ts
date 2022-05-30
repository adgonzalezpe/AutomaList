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
import { Artist } from '../schemas/artist.schema';

export class CreateSongDto {
	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@IsString()
	@IsNotEmpty()
	readonly idSongSpotify: string;

	@IsDate()
	@IsNotEmpty()
	readonly releaseDate: Date;

	@IsArray()
	@IsOptional()
	@IsEmpty()
	readonly artists: Artist[];

	@IsString()
	@IsUrl()
	@IsNotEmpty()
	readonly imageUrl: string;
}

export class UpdateSongDto extends PartialType(CreateSongDto) {}
