const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.post('/webhook', async (req, res) => {
  const { origin, destination, phone } = req.body;

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
      params: {
        origin,
        destination,
        key: apiKey
      }
    });

    const route = response.data.routes[0].legs[0];
    const distance = route.distance.text;
    const duration = route.duration.text;

    const message = `Trajet de ${origin} à ${destination} : ${distance}, durée estimée ${duration}.`;

    console.log('Message envoyé :', message);

    // Optionnel : ici tu peux utiliser Twilio pour envoyer le message au téléphone
    // await sendSMS(phone, message); // à activer plus tard

    res.json({ success: true, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.listen(port, () => {
  console.log(`Serveur webhook en ligne sur le port ${port}`);
});
