import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Artist } from 'src/artists/schemas/artist.schema';
import { Song } from 'src/artists/schemas/song.schema';
import { Playlist } from 'src/playlists/schemas/playlist.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({type: String, unique: true})
  username: string;

  @Prop({type: String, required: true, select: false})
  password: string;

  @Prop({type: String, required: true})
  name: string;

  @Prop({type: String, default: 'user'})
  role: string;

  @Prop({type: String, required: true, select: false})
  email: string;

  @Prop({type: String})
  imageProfile: string;

  @Prop({type: String})
  idUserSpotify: string;

  @Prop ({ type: [{ type: mongoose.Types.ObjectId, ref: 'Artist'}] })
  artists: Artist[];

  @Prop ({ type: [{ type: mongoose.Types.ObjectId, ref: 'Song'}] })
  songs: Song[];

  @Prop ({ type: [{ type: mongoose.Types.ObjectId, ref: 'Playlist'}] })
  playlists: Playlist[];
}

export const UserSchema = SchemaFactory.createForClass(User)
