const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Twilio config
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

app.use(bodyParser.urlencoded({ extended: false }));

// Webhook route
app.post('/webhook', (req, res) => {
  const incomingMsg = req.body.Body;
  const sender = req.body.From;

  console.log(`Message reçu de ${sender} : ${incomingMsg}`);

  let responseMsg = "Bienvenue sur MobiVerse 🚀. Merci pour votre message.";

  // Exemple de logique personnalisée
  if (incomingMsg.toLowerCase().includes("bonjour")) {
    responseMsg = "Bonjour ! 👋 Que puis-je faire pour vous aujourd'hui ?";
  }

  twilioClient.messages.create({
    body: responseMsg,
    from: twilioNumber,
    to: sender
  });

  res.send('<Response></Response>');
});

app.get('/', (req, res) => {
  res.send('Serveur MobiVerse Webhook opérationnel ✅');
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
