import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import config from 'src/config';
import { PayloadToken } from '../models/token.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private authService: AuthService,
		@Inject(config.KEY) configService: ConfigType<typeof config>
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.jwtSecret,
		});
	}

	async validate(payload: PayloadToken) {
		return payload
	}
}
