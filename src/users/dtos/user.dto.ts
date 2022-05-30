import { PartialType } from '@nestjs/mapped-types';
import {
	IsArray,
	IsEmpty,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
} from 'class-validator';
import { Artist } from 'src/artists/schemas/artist.schema';
import { Song } from 'src/artists/schemas/song.schema';
import { Playlist } from 'src/playlists/schemas/playlist.schema';

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	readonly username: string;

	@IsString()
	@IsNotEmpty()
	@Length(6, 20)
	readonly password: string;

	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@IsString()
	readonly role: string = 'user';

	@IsString()
	@IsNotEmpty()
	readonly email: string;

	@IsString()
	@IsOptional()
	readonly imageProfile: string;

	@IsOptional()
	@IsString()
	readonly idUserSpotify: string;

	@IsOptional()
	@IsArray()
	readonly playlists: Playlist[];

	@IsOptional()
	@IsArray()
	readonly artists: Artist[];

	@IsOptional()
	@IsArray()
	readonly songs: Song[]
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class DeleteUserDto {
	@IsString()
	@IsNotEmpty()
	readonly username: string;
}
