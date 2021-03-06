const express = require('express')
const {Kafka} = require('kafkajs') 
const nodemailer = require('nodemailer')

const app = express();

app.listen(3000)

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
})

const topic = 'sendEmailToAdmins'
const consumer = kafka.consumer( {groupId: 'bet-emails'})
const consumer_admin = kafka.consumer( {groupId: 'admin-group'})
const consumer_congrats = kafka.consumer( {groupId: 'congrats-user'})
const consumer_resetPassword = kafka.consumer( {groupId: 'forgot-password'})

// Send messages to all the admins when a user make a bet

async function runBetFromAdmins(){
  await consumer.connect()
  await consumer.subscribe( { topic } )
  await consumer.run({
    eachMessage: async ({ message }) => {
      const admins = message.value.toString()
      const admin_toJSON = JSON.parse(admins)
      const {email, username, player} = admin_toJSON.admin
      newBetAdmin(username, email, player)
    },
  })
} 


async function runBetFromUser(){
  await consumer_admin.connect()
  await consumer_admin.subscribe( { topic: 'sendEmailToUserWhenMakeABet' } )
  await consumer_admin.run({
    eachMessage: async ({ message }) => {
      const user = message.value.toString()
      const user_toJSON  = JSON.parse(user)
      const {email, username} = user_toJSON.user
      newBet(username, email)
    }
  })
}
//func
async function runCongrats(){
  await consumer_congrats.connect()
  await consumer_congrats.subscribe( {topic: 'congratsNewUser'})
  await consumer_congrats.run({
    eachMessage: async ({ message }) => {
      const user = message.value.toString()
      const user_toJSON  = JSON.parse(user)
      const {email, username} = user_toJSON.user
      congratSingIn(email, username)
    }
  })
}

async function resetPasswors(){
  await consumer_resetPassword.connect()
  await consumer_resetPassword.subscribe( {topic: 'forgot-password'})
  await consumer_resetPassword.run({
    eachMessage: async ({ message }) => {
      const user = message.value.toString()
      const user_toJSON  = JSON.parse(user)
      const {email, username, token, url} = user_toJSON.user
      forgotPassowrd(email, username, token, url)
    }
  })
}

runBetFromUser().catch(console.error)
runBetFromAdmins().catch(console.error)
runCongrats().catch(console.error)
resetPasswors().catch(console.error)


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
    text: `Prezado(a) administrador ${username}. \n\n, o usu??rio ${user} realizou uma aposta!. \n\n`,
    html: `<p>Prezado(a) administrador ${username}. \n\n, o usu??rio ${user} realizou uma aposta!<br><br></p>`
  }

  transport.sendMail(message)
}

async function congratSingIn(email, username){

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
    subject: "Sua conta foi criada!",
    text: `Prezado(a) ${username}. \n\n, seja muito bem vindo, sua conta foi criada com sucesso!. \n\n`,
    html: `<p>Prezado(a) ${username}. \n\n, seja muito bem vindo, sua conta foi criada com sucesso!. <br><br></p>`
  };

  transport.sendMail(message)
}

async function forgotPassowrd(email, username, token, url){
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
    subject: "Recupera????o de Senha",
    text: `Prezado(a) ${username}. \n\n segue abaixo informa????es para que possa recuperar sua senha. \n\n
    Use o token: ${token}`,
    html: `<strong>Recupera????o de Senha<strong>

    <p>Ol?? ${username}, voc?? solicitou uma recupera????o de senha.</p>

    <p>Para dar prosseguimento, utilize o token ${token}</p>

    <a href="${url}?token=${token}">Reset Password</a>
    `
  };

  transport.sendMail(message, function(err) {
    if(err){
      return {
        erro: true,
        message: "Email can't bee sent"
      }
    }
  })


  return {
    error: false,
    message: 'Email sent correctly'
  }
}