const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Configuration Twilio depuis Render
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

app.use(bodyParser.urlencoded({ extended: false }));

// Route Webhook
app.post('/webhook', async (req, res) => {
  const incomingMsg = req.body.Body;
  const sender = req.body.From;

  console.log(`📩 Nouveau message reçu de ${sender} : ${incomingMsg}`);

  let responseMsg = "🚀 Bienvenue sur *MobiVerse* – votre assistant mobilité intelligent. Posez-moi une question !";

  // Réponses dynamiques simples
  const msg = incomingMsg.toLowerCase();

  if (msg.includes('bonjour')) {
    responseMsg = "👋 Bonjour ! Comment puis-je vous aider aujourd’hui ?";
  } else if (msg.includes('casablanca')) {
    responseMsg = "📍 Casablanca : voici les options de transport à venir…";
  } else if (msg.includes('prix')) {
    responseMsg = "💰 Les prix dépendent de la distance. Veuillez préciser le trajet.";
  } else if (msg.includes('merci')) {
    responseMsg = "🙏 Avec plaisir ! L’équipe MobiVerse reste disponible.";
  }

  try {
    await client.messages.create({
      body: responseMsg,
      from: fromNumber,
      to: sender
    });

    console.log(`✅ Message envoyé à ${sender}`);
  } catch (error) {
    console.error('❌ Erreur d’envoi Twilio :', error.message);
  }

  // Réponse obligatoire à Twilio
  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>');
});

// Test route
app.get('/', (req, res) => {
  res.send('✅ Serveur Webhook MobiVerse opérationnel');
});

app.listen(port, () => {
  console.log(`🚀 MobiVerse en ligne sur le port ${port}`);
});
