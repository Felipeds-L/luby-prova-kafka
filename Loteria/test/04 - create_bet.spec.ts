import test from 'japa'
import supertest from 'supertest'
import User from '../app/Models/User'
import Bet from '../app/Models/Bet'
import Game from 'App/Models/Game'

const baseUrl = `localhost:3333`

test.group('Create one Mega-Sena bet', async (group) => {
  let token = ''
  group.before(async () => {
    const user = new User()

    user.email = 'daniel@vieira.com'
    user.password = 'Man'

    const logged = await supertest(baseUrl).post('/api/login').send(user).expect(200);

    const json_log = JSON.parse(logged.text)

    token = json_log['token']['token']
  })

  test('create a bet, from the Mega-Sena game', async() => {
    const bet = new Bet()
    const bet2 = new Bet()
    const bet3 = new Bet()
    const bet4 = new Bet()

    const game = await Game.findOrFail(2)
    const numbers = generateNumber(game)
    const numbers2 = generateNumber(game)
    const numbers3 = generateNumber(game)
    const numbers4 = generateNumber(game)


    bet.user_id = 16,
    bet.game_id = 2,
    bet.numbers_choosed = numbers

    bet2.user_id = 16,
    bet2.game_id = 2,
    bet2.numbers_choosed = numbers2

    bet3.user_id = 16,
    bet3.game_id = 2,
    bet3.numbers_choosed = numbers3

    bet4.user_id = 16,
    bet4.game_id = 2,
    bet4.numbers_choosed = numbers4

    await supertest(baseUrl).post('/bet').send({bets: [bet, bet2, bet3, bet4]}).expect(200).set('Authorization', `Bearer ${token}`)
  })

  test('error on create a bet, from the Mega-Sena game costing less then min-cart-value', async() => {
    const bet = new Bet()


    const game = await Game.findOrFail(2)
    const numbers = generateNumber(game)

    bet.user_id = 16,
    bet.game_id = 2,
    bet.numbers_choosed = numbers

    await supertest(baseUrl).post('/bet').send({bets: [bet]}).expect(500).set('Authorization', `Bearer ${token}`)

  })
})

function generateNumber(game){
  let check: number[] = [], lista: number[] = []
  while(check.length < game.max_number){
    const valor = Math.floor(Math.random()*game.range+1);
    lista.push(valor)
    check = [... new Set(lista)]
  }
  let number = check.toString()
  lista = []
  return number
}
