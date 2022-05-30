import { PartialType } from '@nestjs/mapped-types';
import {
	IsBoolean,
	IsNotEmpty,
	IsString,
} from 'class-validator';

export class CreatePlaylistSpotifyDto {
	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@IsNotEmpty()
	@IsString()
	readonly description: string;

	@IsNotEmpty()
	@IsBoolean()
	readonly public: boolean;
}

export class UpdatePlaylistDto extends PartialType(CreatePlaylistSpotifyDto) {}
