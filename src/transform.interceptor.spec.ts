import { Test, TestingModule } from '@nestjs/testing';
import { TransformInterceptor } from './transform.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();

    interceptor = module.get<TransformInterceptor>(TransformInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform instance to plain object', async () => {
    const context = {} as ExecutionContext;
    const next = {
      handle: jest.fn(() => of(new TestClass('test'))),
    } as CallHandler;

    const transformedData = await interceptor
      .intercept(context, next)
      .toPromise();

    expect(instanceToPlain(new TestClass('test'))).toEqual(transformedData);
    expect(next.handle).toHaveBeenCalled();
  });
});

class TestClass {
  constructor(public value: string) {}
}
