import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/services/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService} from '@nestjs/jwt'
import { User } from 'src/users/schemas/user.schema';
import { PayloadToken } from '../models/token.model';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateUser(email: string, password: string) {
		const user = await this.usersService.login(email);

		if (user) {
			const isMatch = await bcrypt.compare(password, user.password);
			if (isMatch) {
				const { password, email, ...rta } = user.toJSON();
				return rta;
			}
		}

		return null;
	}

	generateJWT(user: User) {
		const payload: PayloadToken = { role: user.role, idUserSpotify: user.idUserSpotify, sub: user.username };
		return {
			access_token: this.jwtService.sign(payload),
			user
		}
	}
}
