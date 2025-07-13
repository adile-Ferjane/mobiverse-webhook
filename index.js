const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // clé stockée dans Render (jamais dans le code)
});

app.use(bodyParser.urlencoded({ extended: false }));

// Webhook principal
app.post('/webhook', async (req, res) => {
  const incomingMsg = req.body.Body?.trim() || '';
  const sender = req.body.From;

  console.log(`📩 Message reçu de ${sender} : ${incomingMsg}`);

  let responseMsg = "🚀 Bienvenue sur *MobiVerse* – votre assistant mobilité intelligent. Posez-moi une question !";

  const msg = incomingMsg.toLowerCase();

  // Réponses simples prédéfinies
  if (msg.includes('bonjour')) {
    responseMsg = "👋 Bonjour ! Comment puis-je vous aider aujourd’hui ?";
  } else if (msg.includes('casablanca')) {
    responseMsg = "📍 Casablanca : voici les options de transport à venir…";
  } else if (msg.includes('prix')) {
    responseMsg = "💰 Les prix dépendent de la distance. Veuillez préciser le trajet.";
  } else if (msg.includes('merci')) {
    responseMsg = "🙏 Avec plaisir ! L’équipe MobiVerse reste disponible.";
  } else {
    // Si aucune réponse simple ne correspond → passer par GPT
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4", // Tu peux changer en "gpt-3.5-turbo" si besoin
        messages: [{ role: "user", content: incomingMsg }],
        temperature: 0.7,
        max_tokens: 100,
      });

      responseMsg = completion.choices[0].message.content;
    } catch (err) {
      console.error("❌ Erreur GPT :", err.message);
      responseMsg = "🤖 Je n’ai pas pu répondre pour l’instant. Réessayez dans un instant.";
    }
  }

  // Envoi de la réponse par SMS via Twilio
  try {
    await client.messages.create({
      body: responseMsg,
      from: fromNumber,
      to: sender
    });

    console.log(`✅ Réponse envoyée à ${sender}`);
  } catch (error) {
    console.error('❌ Erreur d’envoi Twilio :', error.message);
  }

  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>');
});

// Route de test
app.get('/', (req, res) => {
  res.send('✅ Webhook MobiVerse GPT opérationnel');
});

app.listen(port, () => {
  console.log(`🚀 Serveur en ligne sur le port ${port}`);
});
