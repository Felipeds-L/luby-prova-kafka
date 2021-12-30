const express = require('express') 
const {Kafka} = require('kafkajs') 
const nodemailer = require('nodemailer')

const app = express()


app.listen(3000)


const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka1:9092', 'kafka2:9092']
})

const topic = 'send_email_bet'
const consumer = kafka.consumer({ groupId: 'bet_email' })
async function run(){
  await consumer.connect()
  await consumer.subsribe({ topic: topic})
  await consumer.run({
    eachMessage: async ({ message }) => {
      console.log({
        key: message.key.toString(),
        value: message.value.toString()
      })
    }
  })
}
run().catch(console.error)
// app.get('/', (req, res) => {
//   "use strict";


async function main() {

  let testAccount = await nodemailer.createTestAccount();


  let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "583128b8852a7b",
      pass: "495b0a35ecc53b"
    }
  });


  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to: "bar@example.com, baz@example.com", 
    subject: "Hello ✔", 
    text: "Hello world?", 
    html: "<b>Hello world?</b>"
  });

  console.log("Message sent: %s", info.messageId);


  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}

main().catch(console.error);
// })

// app.listen(3000)