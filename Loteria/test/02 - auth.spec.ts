import test from 'japa'
import supertest from 'supertest'
import User from '../app/Models/User'

const baseUrl = `http://localhost:3333`


test.group('Auth', () =>{
  test('testing authentication', async () => {

    const user = new User()
    user.email = 'daniel@vieira.com'
    user.password = 'Man'

    await supertest(baseUrl).post('/api/login').send(user).expect(200);
  });

  test('authentication failure, password is wrong', async() => {

    const user = new User()
    user.email = 'daniel@vieira.com'
    user.password = 'Girl'

    await supertest(baseUrl).post('/api/login').send(user).expect(401);
  });

  test('authentication failure, email is wrong', async() => {

    const user = new User()
    user.email = 'tayna@vieira.com'
    user.password = 'Man'

    await supertest(baseUrl).post('/api/login').send(user).expect(401);
  });
})




