import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const MOCK_USER_ID = 'user-uuid-001';

const mockFile = {
  id: 'uuid-123',
  name: 'test.pdf',
  url: 'https://supabase.co/storage/v1/object/public/bucket/test.pdf',
  type: 'application/pdf',
  size: 1024,
  createdAt: new Date('2026-04-07T10:00:00Z'),
  userId: MOCK_USER_ID,
};

const mockPrisma = {
  file: {
    create: jest.fn().mockResolvedValue(mockFile),
    findMany: jest.fn().mockResolvedValue([mockFile]),
    findUnique: jest.fn().mockResolvedValue(mockFile),
    delete: jest.fn().mockResolvedValue(mockFile),
  },
};

const mockStorage = {
  upload: jest.fn().mockResolvedValue(mockFile.url),
  delete: jest.fn().mockResolvedValue(undefined),
};

function makeMulterFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('fake pdf content'),
    size: 1024,
    stream: null,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    jest.clearAllMocks();
  });

  describe('uploadFile()', () => {
    it('should upload file to storage and save only metadata to DB', async () => {
      mockStorage.upload.mockResolvedValue(mockFile.url);
      mockPrisma.file.create.mockResolvedValue(mockFile);

      const file = makeMulterFile();
      const result = await service.uploadFile(file, MOCK_USER_ID);

      expect(mockStorage.upload).toHaveBeenCalledWith(file.buffer, file.originalname, file.mimetype);

      expect(mockPrisma.file.create).toHaveBeenCalledWith({
        data: {
          name: file.originalname,
          url: mockFile.url,
          type: file.mimetype,
          size: file.size,
          userId: MOCK_USER_ID,
        },
      });

      const savedData = mockPrisma.file.create.mock.calls[0][0].data;
      expect(savedData).not.toHaveProperty('buffer');
      expect(savedData).not.toHaveProperty('base64');
      expect(result).toEqual(mockFile);
    });

    it('should reject files with disallowed MIME types', async () => {
      const file = makeMulterFile({ mimetype: 'application/exe' });
      await expect(service.uploadFile(file, MOCK_USER_ID)).rejects.toThrow(BadRequestException);
      expect(mockStorage.upload).not.toHaveBeenCalled();
    });

    it('should reject files larger than 10MB', async () => {
      const file = makeMulterFile({ size: 11 * 1024 * 1024 });
      await expect(service.uploadFile(file, MOCK_USER_ID)).rejects.toThrow(BadRequestException);
      expect(mockStorage.upload).not.toHaveBeenCalled();
    });

    it('should accept image/jpeg files', async () => {
      mockStorage.upload.mockResolvedValue('https://supabase.co/image.jpg');
      mockPrisma.file.create.mockResolvedValue({ ...mockFile, type: 'image/jpeg' });
      const file = makeMulterFile({ mimetype: 'image/jpeg', originalname: 'photo.jpg' });
      await expect(service.uploadFile(file, MOCK_USER_ID)).resolves.not.toThrow();
    });

    it('should accept image/png files', async () => {
      mockStorage.upload.mockResolvedValue('https://supabase.co/image.png');
      mockPrisma.file.create.mockResolvedValue({ ...mockFile, type: 'image/png' });
      const file = makeMulterFile({ mimetype: 'image/png', originalname: 'image.png' });
      await expect(service.uploadFile(file, MOCK_USER_ID)).resolves.not.toThrow();
    });
  });

  describe('findAll()', () => {
    it('should return files filtered by userId', async () => {
      mockPrisma.file.findMany.mockResolvedValue([mockFile]);
      const result = await service.findAll(MOCK_USER_ID);
      expect(mockPrisma.file.findMany).toHaveBeenCalledWith({
        where: { userId: MOCK_USER_ID },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockFile]);
    });

    it('should return empty array when no files exist', async () => {
      mockPrisma.file.findMany.mockResolvedValue([]);
      const result = await service.findAll(MOCK_USER_ID);
      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('should return a file by id for the correct user', async () => {
      mockPrisma.file.findUnique.mockResolvedValue(mockFile);
      const result = await service.findOne('uuid-123', MOCK_USER_ID);
      expect(result).toEqual(mockFile);
    });

    it('should throw NotFoundException for non-existent id', async () => {
      mockPrisma.file.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existent', MOCK_USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('should delete from storage then from database', async () => {
      mockPrisma.file.findUnique.mockResolvedValue(mockFile);
      const result = await service.remove('uuid-123', MOCK_USER_ID);
      expect(mockStorage.delete).toHaveBeenCalledWith(mockFile.url);
      expect(mockPrisma.file.delete).toHaveBeenCalledWith({ where: { id: 'uuid-123' } });
      expect(result).toEqual({ message: 'Arquivo excluído com sucesso' });
    });

    it('should throw NotFoundException when file does not exist', async () => {
      mockPrisma.file.findUnique.mockResolvedValue(null);
      await expect(service.remove('non-existent', MOCK_USER_ID)).rejects.toThrow(NotFoundException);
      expect(mockStorage.delete).not.toHaveBeenCalled();
    });
  });

  describe('fixEncoding / uploadFile() filename handling', () => {
  it('should keep filename as-is when already valid UTF-8', async () => {
    mockStorage.upload.mockResolvedValue(mockFile.url);
    mockPrisma.file.create.mockResolvedValue(mockFile);

    const file = makeMulterFile({ originalname: 'relatorio-mensal.pdf' });
    await service.uploadFile(file, MOCK_USER_ID);

    expect(mockPrisma.file.create.mock.calls[0][0].data.name).toBe('relatorio-mensal.pdf');
  });

  it('should convert latin1 mojibake to correct UTF-8', async () => {
    // Simulates what Multer does on Windows with special chars:
    // "Técnico" becomes "TÃ©cnico" in latin1 mangling
    const mangled = Buffer.from('Técnico', 'utf8').toString('latin1');
    mockStorage.upload.mockResolvedValue(mockFile.url);
    mockPrisma.file.create.mockResolvedValue({ ...mockFile, name: 'Técnico.pdf' });

    const file = makeMulterFile({ originalname: mangled + '.pdf', mimetype: 'application/pdf' });
    await service.uploadFile(file, MOCK_USER_ID);

    const savedName = mockPrisma.file.create.mock.calls[0][0].data.name;
    expect(savedName).toBe('Técnico.pdf');
  });

  it('should handle pure ASCII filenames without modification', async () => {
    mockStorage.upload.mockResolvedValue(mockFile.url);
    mockPrisma.file.create.mockResolvedValue(mockFile);

    const file = makeMulterFile({ originalname: 'foto-2026.jpg', mimetype: 'image/jpeg' });
    await service.uploadFile(file, MOCK_USER_ID);

    expect(mockPrisma.file.create.mock.calls[0][0].data.name).toBe('foto-2026.jpg');
  });
});
});