let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here') {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.error('Stripe initialization error:', error);
}

exports.createPaymentIntent = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ success: false, message: 'Stripe is not configured.' });
  }
  try {
    const { amount, currency = 'usd', bookingDetails } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount provided' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        customerId: req.user.id,
        customerEmail: req.user.email,
        bookingFrom: bookingDetails?.from || '',
        bookingTo: bookingDetails?.to || '',
        bookingDate: bookingDetails?.date || '',
        bookingTime: bookingDetails?.time || ''
      }
    });
    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ success: false, message: 'Error creating payment intent', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

exports.confirmPayment = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ success: false, message: 'Stripe is not configured.' });
  }
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'Payment intent ID is required' });
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    res.status(200).json({ success: true, paymentIntent: { id: paymentIntent.id, status: paymentIntent.status, amount: paymentIntent.amount / 100, currency: paymentIntent.currency, paymentMethod: paymentIntent.payment_method } });
  } catch (error) {
    console.error('Stripe confirm payment error:', error);
    res.status(500).json({ success: false, message: 'Error confirming payment', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

exports.getPaymentDetails = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ success: false, message: 'Stripe is not configured.' });
  }
  try {
    const { paymentIntentId } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    let paymentMethodDetails = null;
    if (paymentIntent.payment_method) {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
      paymentMethodDetails = { type: paymentMethod.type, card: paymentMethod.card ? { brand: paymentMethod.card.brand, last4: paymentMethod.card.last4, expMonth: paymentMethod.card.exp_month, expYear: paymentMethod.card.exp_year } : null };
    }
    res.status(200).json({ success: true, payment: { id: paymentIntent.id, amount: paymentIntent.amount / 100, currency: paymentIntent.currency.toUpperCase(), status: paymentIntent.status, created: paymentIntent.created, paymentMethod: paymentMethodDetails } });
  } catch (error) {
    console.error('Stripe get payment error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving payment details', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
