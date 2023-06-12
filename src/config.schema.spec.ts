import { configValidationSchema } from './config.schema';

describe('configValidationSchema', () => {
  it('should validate a correct configuration object', () => {
    const validConfig = {
      STAGE: 'test',
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USERNAME: 'test_user',
      DB_PASSWORD: 'test_password',
      DB_DATABASE: 'test_db',
      JWT_SECRET: 'a'.repeat(64),
    };

    const { error } = configValidationSchema.validate(validConfig);
    expect(error).toBeUndefined();
  });

  it.each`
    property         | value
    ${'STAGE'}       | ${undefined}
    ${'DB_HOST'}     | ${undefined}
    ${'DB_PORT'}     | ${'invalid_port'}
    ${'DB_USERNAME'} | ${undefined}
    ${'DB_PASSWORD'} | ${undefined}
    ${'DB_DATABASE'} | ${undefined}
    ${'JWT_SECRET'}  | ${'a'.repeat(63)}
  `('should fail when property $property is invalid', ({ property, value }) => {
    const invalidConfig = {
      STAGE: 'test',
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USERNAME: 'test_user',
      DB_PASSWORD: 'test_password',
      DB_DATABASE: 'test_db',
      JWT_SECRET: 'a'.repeat(64),
      ...{ [property]: value },
    };

    const { error } = configValidationSchema.validate(invalidConfig);
    expect(error).toBeDefined();
  });
});
