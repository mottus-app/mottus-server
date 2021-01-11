import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
// import { LogInDto } from 'src/users/dto/login.dto';

const GRAPHQL_ENDPOINT = '/graphql';

describe('User Module (e2e)', () => {
  let app: INestApplication;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    app.close();
  });

  describe('test', () => {
    const baseTest = () =>
      request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);
    const publicTest = (query: string) => baseTest().send({ query });
    it('works', async () => {
      const data = await publicTest(`query {hello}`).expect(200);
      console.log('data:', data.body);
    });
  });
});
// const GRAPHQL_ENDPOINT = '/graphql';
// const testUser: LogInDto = {
//   email: 'validEmail@gmail.com',
//   password: 'Passowrd1234.',
// };
// describe('AppController (e2e)', () => {
//   let app: INestApplication;
//   const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
//   const publicTest = (query: string) => baseTest().send({ query });

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//     app = moduleFixture.createNestApplication();

//     await app.init();
//   });

//   afterAll(async () => {
//     await app.close();
//   });

//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     // await app.init();
//   });

//   describe('get Hello', () => {
//     it('should get back `hello`', async () => {
//       const data = await publicTest(`
//       query {hello }`);
//       console.log('data:', data);
//     });
//   });

//   it('/ (GET)', () => {
//     return request(app.getHttpServer())
//       .get('/')
//       .expect(200)
//       .expect('Hello World!');
//   });
// });
