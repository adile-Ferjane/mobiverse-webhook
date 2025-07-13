const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware nécessaire
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());

// Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Webhook principal
app.post('/webhook', async (req, res) => {
  const incomingMsg = req.body.Body?.trim() || '';
  const sender = req.body.From;

  console.log(`📩 Message reçu de ${sender} : ${incomingMsg}`);

  let responseMsg = "🚀 Bienvenue sur *MobiVerse* – votre assistant mobilité intelligent. Posez-moi une question !";

  const msg = incomingMsg.toLowerCase();

  const motsCles = {
    bonjour: "👋 Bonjour ! Comment puis-je vous aider aujourd’hui ?",
    casablanca: "📍 Casablanca : voici les options de transport à venir…",
    prix: "💰 Les prix dépendent de la distance. Veuillez préciser le trajet.",
    merci: "🙏 Avec plaisir ! L’équipe MobiVerse reste disponible.",
  };

  let found = false;
  for (const mot in motsCles) {
    if (msg.includes(mot)) {
      responseMsg = motsCles[mot];
      found = true;
      break;
    }
  }

  if (!found) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: incomingMsg }],
        temperature: 0.7,
        max_tokens: 100,
      });
      responseMsg = completion.choices[0].message.content;
    } catch (err) {
      console.error("❌ Erreur GPT :", err.message);
      responseMsg = "🤖 Je n’ai pas pu répondre pour l’instant.";
    }
  }

  try {
    await client.messages.create({
      body: responseMsg,
      from: fromNumber,
      to: sender
    });

    console.log(`✅ Réponse envoyée à ${sender}`);
  } catch (error) {
    console.error('❌ Erreur Twilio :', error.message);
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
