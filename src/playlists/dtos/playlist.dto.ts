import { PartialType } from '@nestjs/mapped-types';
import {
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator';
import { Song } from 'src/artists/schemas/song.schema';

export class CreatePlaylistDto {
	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@IsNotEmpty()
	@IsString()
	readonly idUserSpotify: string;

	@IsNotEmpty()
	@IsString()
	readonly idPlaylistSpotify: string;

	@IsOptional()
	@IsArray()
	readonly songs: Song[]
}

export class UpdatePlaylistDto extends PartialType(CreatePlaylistDto) {}
