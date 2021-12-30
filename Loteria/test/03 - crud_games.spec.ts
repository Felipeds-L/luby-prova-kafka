import test from 'japa'
import supertest from 'supertest'
import Game from 'App/Models/Game'
import User from 'App/Models/User'

const baseUrl = `http://localhost:3333`


test.group('CRUD - Games', (group) => {
  let token = ''

  group.before(async () => {
    const user = new User()

    user.email = 'daniel@vieira.com'
    user.password = 'Man'

    const logged = await supertest(baseUrl).post('/api/login').send(user).expect(200);

    const json_log = JSON.parse(logged.text)

    token = json_log['token']['token']
  })

  test('index all games', async () => {
    await supertest(baseUrl).get('/games').expect(200).set('Authorization', `Bearer ${token}`)
  });

  test('show one game', async () => {
    await supertest(baseUrl).get('/games/2').expect(200).set('Authorization', `Bearer ${token}`)
  });

  test('error on select a game who do not exist', async() => {
    await supertest(baseUrl).get('/games/9').expect(200).set('Authorization', `Bearer ${token}`)
  })

  test('create one game', async () => {
    const game = new Game()
    game.type = 'Novo Jogo Legal',
    game.description = 'Um jogo muito mais interessante'
    game.range = 50,
    game.price = 8.4,
    game.max_number = 5,
    game.color = '#0099ff'
    await supertest(baseUrl).post('/games').expect(200).send(game).set('Authorization', `Bearer ${token}`)
  });

  test('erro on create a game with user not authenticated', async() =>{
    const game = new Game()
    game.type = 'Novo Jogo Legal',
    game.description = 'Um jogo muito mais interessante'
    game.range = 50,
    game.price = 8.4,
    game.max_number = 5,
    game.color = '#0099ff'
    await supertest(baseUrl).post('/games').expect(401).send(game)
  })

  test('update a game', async () => {
    const game = new Game()
    game.type = 'Um novíssimo novo Jogo',
    game.description = 'Um jogo muito mais interessante do que somente interessante'
    game.range = 32,
    game.price = 9,
    game.max_number = 3,
    game.color = '#332253'
    await supertest(baseUrl).put('/games/4').expect(200).send(game).set('Authorization', `Bearer ${token}`)
  });

  test('update a game who do not exist', async () => {
    const game = new Game()
    game.type = 'Um novíssimo novo Jogo',
    game.description = 'Um jogo muito mais interessante do que somente interessante'
    game.range = 32,
    game.price = 9,
    game.max_number = 3,
    game.color = '#332253'
    await supertest(baseUrl).put('/games/8').expect(200).send(game).set('Authorization', `Bearer ${token}`)
  });

  test('delete a game', async () => {
    await supertest(baseUrl).delete('/games/3').expect(200).set('Authorization', `Bearer ${token}`)
  })
  test('error on delete a game who do not exist', async () => {
    await supertest(baseUrl).delete('/games/8').expect(400).set('Authorization', `Bearer ${token}`)
  })

})
