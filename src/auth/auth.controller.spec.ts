import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

const mockAuthService = () => ({
  createUser: jest.fn(),
  signIn: jest.fn(),
});

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useFactory: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signup', () => {
    it('should call AuthService.createUser with the given authCredentialsDto', async () => {
      const testAuthCredentialsDto: AuthCredentialsDto = {
        username: 'test_username',
        password: 'test_password',
      };

      const createUserSpy = jest
        .spyOn(authService, 'createUser')
        .mockResolvedValue();

      await authController.signUp(testAuthCredentialsDto);

      expect(createUserSpy).toHaveBeenCalledWith(testAuthCredentialsDto);
    });
  });

  describe('signin', () => {
    it('should call AuthService.signIn with the given authCredentialsDto', async () => {
      const testAuthCredentialsDto: AuthCredentialsDto = {
        username: 'test_username',
        password: 'test_password',
      };
      const testAccessToken = 'test-access-token';

      const signInSpy = jest
        .spyOn(authService, 'signIn')
        .mockResolvedValue({ accessToken: testAccessToken });

      const result = await authController.signIn(testAuthCredentialsDto);

      expect(signInSpy).toHaveBeenCalledWith(testAuthCredentialsDto);
      expect(result).toEqual({ accessToken: testAccessToken });
    });
  });
});
