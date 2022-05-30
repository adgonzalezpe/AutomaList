import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { Artist, ArtistSchema } from './artist.schema';

export type SongDocument = Song & Document;

@Schema()
export class Song {
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: String, unique: true })
	idSongSpotify: string;

	@Prop({ type: Date, required: true })
	releaseDate: Date;

	@Prop({ type: [{type: mongoose.Types.ObjectId, ref: 'Artist'}] })
	artists: Artist[];

	@Prop ({ type: String, required: true})
	imageUrl: string;
}

export const SongSchema = SchemaFactory.createForClass(Song);
