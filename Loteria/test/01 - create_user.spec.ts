import test from 'japa'
import supertest from 'supertest'
import User from '../app/Models/User'

const baseUrl = `http://localhost:3333`

test.group('Users', async () => {

  test('create a user', async () => {
    const user = new User()
    user.email = 'tddteste02@tdd.teste'
    user.username = 'tdd_user02',
    user.password = 'tdd_password'

    await supertest(baseUrl).post('/api/users').send(user).expect(200)
  })

  test('failure on create a user without password', async () => {
    const user = new User()
    user.email = 'newTDD_failure01@user.login'
    user.username = 'TheNewFalilure01',
    await supertest(baseUrl).post('/api/users').send(user).expect(400)
  })

  test('failure on create a email already in use', async () => {
    const user = new User()
    user.email = 'tddteste02@tdd.teste'
    user.username = 'tdd_user01',
    user.password = 'tdd_password',
    await supertest(baseUrl).post('/api/users').send(user).expect(400)
  })

  test('failure on create a username already in use', async () => {
    const user = new User()
    user.email = 'tddteste01@tdd.teste'
    user.username = 'tdd_user02',
    user.password = 'tdd_password',
    await supertest(baseUrl).post('/api/users').send(user).expect(422)
  })
})
