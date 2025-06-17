import { Test, TestingModule } from '@nestjs/testing';
import { LinkedInController } from './linkedin.controller';

describe('LinkedinController', () => {
  let controller: LinkedInController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkedInController],
    }).compile();

    controller = module.get<LinkedInController>(LinkedInController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
