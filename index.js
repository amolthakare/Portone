const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const PaymentModal = require('./paymentModal');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Route handler for creating a payment intent
app.post('/api/v1/create_intent', async (req, res) => {
    const { amount, currency } = req.body;
    const paymentIntentRequest = new PaymentModal(amount, currency);
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({       
        amount: paymentIntentRequest.amount,
        currency: paymentIntentRequest.currency,
        payment_method: "pm_card_us", 
        payment_method_types: ['card'],  
        payment_method_options: {
          card: {
            capture_method: 'manual',     
          },
        },
        confirm:true                    
      });
      res.status(201).json(paymentIntent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Route handler for capturing a payment intent
app.post('/api/v1/capture_intent/:id', async (req, res) => {
    const { id } = req.params;          

    try {
      const paymentIntent = await stripe.paymentIntents.capture(id); 
      res.status(200).json(paymentIntent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Route handler for creating a refund
app.post('/api/v1/create_refund/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const refund = await stripe.refunds.create({
      payment_intent: id,
    });
    res.status(201).json(refund);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route handler for listing all payment intents
app.get('/api/v1/get_intents', async (req, res) => {
  try {
    const paymentIntents = await stripe.paymentIntents.list();
    res.status(200).json(paymentIntents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});