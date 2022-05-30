import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { Roles } from './auth/decorators/roles.decorator';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Role } from './auth/models/roles.model';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Public()
	@Get()
	welcome(): string {
		return this.appService.welcome();
	}

	@Roles(Role.ADMIN)
	@Get('nuevo')
	nuevo(){
		return 'Hola'
	}
}
