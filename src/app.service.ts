import { Injectable } from '@nestjs/common';
import { basename } from 'path';

@Injectable()
export class AppService {
	constructor(
	) {}

	welcome(): string {
		return `Hello, this is the APP of GoList. For more information, visit our docs`
	}
}
