const {Kafka} = require('kafkajs') 
const nodemailer = require('nodemailer')


const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
})

const topic = 'sendEmailToAdmins'
const consumer = kafka.consumer( {groupId: 'bet-emails-admin'})
const consumer2 = kafka.consumer( {groupId: 'bet-emails'})

// Send messages to all the admins when a user make a bet
async function runBetFromAdmins(){
  await consumer.connect()
  await consumer.subscribe( { topic } )
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('Show show only the part of admins: ' + message.value.toString())
      const admins = message.value.toString()
      const admin_toJSON = JSON.parse(admins)
      const email = admin_toJSON.admin.email
      const username = admin_toJSON.admin.username
      const gamer_name = admin_toJSON.admin.gamer
      newBetAdmin(username, email, gamer_name)
    },
  })

  await consumer.disconnect()
} 

async function runBetFromUser(){
  await consumer2.connect()
  await consumer2.subscribe( { topic: 'sendEmailToUserWhenMakeABet' } )
  await consumer2.run({
    eachMessage: async ({topic, partition, message}) => {
      console.log('Should show the part of user: ' + message.value.toString())
      const user = message.value.toString()
      const user_toJSON  = JSON.parse(user)
      const email = user_toJSON.user.email
      const username = user_toJSON.user.username
      newBet(username, email)
    }
  })

}


runBetFromAdmins().catch(console.error)
runBetFromUser().catch(console.error)



async function newBet(username, email){
  let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "583128b8852a7b",
      pass: "495b0a35ecc53b"
    }
  });

  let message = {
    from: "noreply@milk.com",
    to: email,
    subject: "Aposta realizada!",
    text: `Prezado(a) ${username}. \n\n, sua aposta foi realizada com sucesso!. \n\n`,
    html: `<p>Prezado(a) ${username}. \n\n, sua aposta foi realizada com sucesso!<br><br></p>`
  }

  transport.sendMail(message)
}

async function newBetAdmin(username, email, user){
  let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "583128b8852a7b",
      pass: "495b0a35ecc53b"
    }
  });

  let message = {
    from: "noreply@milk.com",
    to: email,
    subject: `User ${user} realizou uma aposta!`,
    text: `Prezado(a) administrador ${username}. \n\n, o usuário ${user} realizou uma aposta!. \n\n`,
    html: `<p>Prezado(a) administrador ${username}. \n\n, o usuário ${user} realizou uma aposta!<br><br></p>`
  }

  transport.sendMail(message)
}
