import { Test, TestingModule } from '@nestjs/testing';
import { CoversController } from './covers.controller';

describe('CoversController', () => {
  let controller: CoversController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoversController],
    }).compile();

    controller = module.get<CoversController>(CoversController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
