import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, response, Response } from 'express';
import { AuthGuard} from '@nestjs/passport'
import { AuthService } from '../services/auth.service';
import { User } from 'src/users/schemas/user.schema';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService){}

	@Get()
	hola(){
		return 'hola'
	}

	@UseGuards(AuthGuard('local'))
	@Post('login')
	login(@Req() req: Request, @Res({passthrough: true}) response: Response) {
		const user = req.user as User;
		
		const token = this.authService.generateJWT(user)

		response.cookie('access_token', token.access_token);

		return 'Logged'
	}
			
	@Post('logout')
	logout(@Res({passthrough: true}) response: Response){
		response.clearCookie('access_token');
		return 'Log out success'
	}
}
