import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyApiController } from './spotify-api.controller';

describe('SpotifyApiController', () => {
  let controller: SpotifyApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpotifyApiController],
    }).compile();

    controller = module.get<SpotifyApiController>(SpotifyApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
