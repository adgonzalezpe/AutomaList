import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';


export type PlaylistDocument = Playlist & Document;

@Schema()
export class Playlist {
  @Prop({type: String, required: true})
  name: string;

  @Prop({type: String, required: true})
  idUserSpotify: string;

  @Prop({type: String, required: true})
  idPlaylistSpotify: string;

}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist)
