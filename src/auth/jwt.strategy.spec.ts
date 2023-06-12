import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload } from './dto/jwt-payload.interface';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => 'JWT_SECRET') },
        },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
      ],
    }).compile();

    jwtStrategy = moduleRef.get<JwtStrategy>(JwtStrategy);
    userRepository = moduleRef.get(getRepositoryToken(User));
  });

  describe('validate', () => {
    it('should validate and return the user based on the JWT payload', async () => {
      const payload: JwtPayload = { username: 'testuser' };
      const expectedResult = new User();
      userRepository.findOneBy = jest.fn().mockResolvedValue(expectedResult);

      const result = await jwtStrategy.validate(payload);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        username: 'testuser',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw an UnauthorizedException if the user is not found', async () => {
      const payload: JwtPayload = { username: 'testuser' };
      userRepository.findOneBy = jest.fn().mockResolvedValue(null);

      expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
