import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { string } from 'joi';
import mongoose from 'mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { Song, SongSchema } from './song.schema';

export type ArtistDocument = Artist & Document;

@Schema()
export class Artist {
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: String, required:true, unique: true })
	idArtistSpotify: string;

	@Prop({ type: Date, default: null})
	lastSearch: Date;

	@Prop({ type: String })
	imageUrl: string;

	@Prop({ type: [{type: mongoose.Types.ObjectId, ref: 'Song'}] })
	songs: Song[];

}

export const ArtistSchema = SchemaFactory.createForClass(Artist);
