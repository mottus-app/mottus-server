import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { COOKIE_NAME } from 'src/utils/cookieName';
import { getMeQuery, logoutMutation, signupMutation } from './utils';

const GRAPHQL_ENDPOINT = '/graphql';

describe('User Module (e2e)', () => {
  let app: INestApplication;
  const base = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  /**
   *
   * @param cookie the cookie that was received upon login
   * @param query the query that we will send for the test
   */
  const privateTest = (cookie: string, query: string) =>
    base().set('Cookie', cookie).send({ query });
  const publicT = (query: string) => base().send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('test', () => {
    it('works to get user, when no session', async () => {
      const { body } = await publicT(getMeQuery);
      expect(body.data.me.errors).toBeNull();
      expect(body.data.me.user).toBeNull();
    });
  });

  it('auth flow', async () => {
    const { body, header } = await publicT(signupMutation);
    const cookie = (header['set-cookie'] as string[]).find((c) =>
      c.includes(COOKIE_NAME),
    );

    const data = await privateTest(cookie, getMeQuery)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body.data.me.user.id).toBeDefined();
    expect(data.body.data.me.user.id).toBe(body.data.signup.user.id);

    const { body: logoutB, headers: logoutHs } = await privateTest(
      cookie,
      logoutMutation,
    );

    const theCookieString = (logoutHs['set-cookie'] as string[]).find((el) =>
      el.includes(COOKIE_NAME),
    );

    const theCookie = theCookieString
      ?.replace(`${COOKIE_NAME}=`, '')
      ?.split(';')[0];

    expect(theCookie).toBeFalsy();
    expect(logoutB.data.logout).toBe(true);
    const { body: logoutAtt2 } = await publicT(logoutMutation);
    expect(logoutAtt2.data.logout).toBe(false);
  });
});
