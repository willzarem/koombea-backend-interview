import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository;
  let jwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    authService = module.get(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      userRepository.create.mockResolvedValue({ password: 'hashedPassword' });
      userRepository.save.mockResolvedValue(undefined);

      const authCredentialsDto = new AuthCredentialsDto();
      authCredentialsDto.username = 'username';
      authCredentialsDto.password = 'password';

      await authService.createUser(authCredentialsDto);

      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw a ConflictException when a user with given username already exists', async () => {
      userRepository.create.mockResolvedValue({ password: 'hashedPassword' });
      userRepository.save.mockRejectedValue({ code: '23505' });

      const authCredentialsDto = new AuthCredentialsDto();
      authCredentialsDto.username = 'username';
      authCredentialsDto.password = 'password';

      await expect(authService.createUser(authCredentialsDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw an InternalServerErrorException', async () => {
      userRepository.create.mockResolvedValue({ password: 'hashedPassword' });
      userRepository.save.mockRejectedValue({ code: 'unknown' });

      const authCredentialsDto = new AuthCredentialsDto();
      authCredentialsDto.username = 'username';
      authCredentialsDto.password = 'password';

      await expect(authService.createUser(authCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('signIn', () => {
    it('should sign in a user successfully and return an access token', async () => {
      userRepository.findOneBy.mockResolvedValue({
        username: 'username',
        password: 'hashedPassword',
      });
      jwtService.sign.mockReturnValue('accessToken');
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation((data, encrypted) => Promise.resolve(true));

      const authCredentialsDto = new AuthCredentialsDto();
      authCredentialsDto.username = 'username';
      authCredentialsDto.password = 'password';

      const result: { accessToken: string } = await authService.signIn(
        authCredentialsDto,
      );

      expect(userRepository.findOneBy).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'accessToken' });
    });
  });
});
