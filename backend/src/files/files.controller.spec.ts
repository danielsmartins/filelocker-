import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

const MOCK_USER_ID = 'user-uuid-001';
const mockReq = { user: { id: MOCK_USER_ID } };

const mockFile = {
  id: 'uuid-123',
  name: 'test.pdf',
  url: 'https://supabase.co/storage/v1/object/public/bucket/test.pdf',
  type: 'application/pdf',
  size: 1024,
  createdAt: new Date('2026-04-07T10:00:00Z'),
  userId: MOCK_USER_ID,
};

const mockFilesService = {
  uploadFile: jest.fn().mockResolvedValue(mockFile),
  findAll: jest.fn().mockResolvedValue([mockFile]),
  findOne: jest.fn().mockResolvedValue(mockFile),
  remove: jest.fn().mockResolvedValue({ message: 'Arquivo excluído com sucesso' }),
};

describe('FilesController', () => {
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [{ provide: FilesService, useValue: mockFilesService }],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    jest.clearAllMocks();
  });

  describe('upload()', () => {
    it('should call service.uploadFile with file and userId', async () => {
      const multerFile = { originalname: 'test.pdf', buffer: Buffer.from('') } as any;
      const result = await controller.upload(multerFile, mockReq);
      expect(mockFilesService.uploadFile).toHaveBeenCalledWith(multerFile, MOCK_USER_ID);
      expect(result).toEqual(mockFile);
    });
  });

  describe('findAll()', () => {
    it('should return files for the authenticated user', async () => {
      const result = await controller.findAll(mockReq);
      expect(mockFilesService.findAll).toHaveBeenCalledWith(MOCK_USER_ID);
      expect(result).toEqual([mockFile]);
    });
  });

  describe('findOne()', () => {
    it('should pass id and userId to service', async () => {
      const result = await controller.findOne('uuid-123', mockReq);
      expect(mockFilesService.findOne).toHaveBeenCalledWith('uuid-123', MOCK_USER_ID);
      expect(result).toEqual(mockFile);
    });
  });

  describe('remove()', () => {
    it('should call service.remove with id and userId', async () => {
      const result = await controller.remove('uuid-123', mockReq);
      expect(mockFilesService.remove).toHaveBeenCalledWith('uuid-123', MOCK_USER_ID);
      expect(result).toEqual({ message: 'Arquivo excluído com sucesso' });
    });
  });
});