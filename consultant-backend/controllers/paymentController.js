/**
 * Payment Controller
 * Handles all payment-related operations including processing payments,
 * retrieving payment history, and managing refunds.
 * 
 * @module controllers/paymentController
 * @requires stripe
 * @requires models/Payment
 * @requires models/Booking
 */

import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { config } from '../config/config.js';

const stripe = new Stripe(config.stripeSecretKey);

/**
 * Creates a payment intent for a booking
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.bookingId - ID of the booking to pay for
 * @param {string} req.body.paymentMethodId - Stripe payment method ID
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Payment intent details
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, paymentMethodId } = req.body;

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('consultantId', 'userId')
      .populate('clientId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.amount * 100, // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${config.clientUrl}/payment/success`,
      metadata: {
        bookingId: booking._id.toString(),
        clientId: booking.clientId._id.toString(),
        consultantId: booking.consultantId._id.toString()
      }
    });

    // Create payment record
    const payment = new Payment({
      bookingId: booking._id,
      clientId: booking.clientId._id,
      consultantId: booking.consultantId._id,
      amount: booking.amount,
      status: paymentIntent.status,
      stripePaymentIntentId: paymentIntent.id
    });

    await payment.save();

    return res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id 
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ message: 'Payment processing failed' });
  }
};

/**
 * Retrieves payment history for the authenticated user
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Array} List of payments
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [
        { clientId: req.user._id },
        { consultantId: req.user._id }
      ]
    })
    .populate('bookingId')
    .populate('clientId', 'name email')
    .populate('consultantId', 'userId')
    .sort({ createdAt: -1 });

    return res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Processes a refund for a payment
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.paymentId - ID of the payment to refund
 * @param {Object} req.body - Request body
 * @param {number} [req.body.amount] - Amount to refund (optional, defaults to full amount)
 * @param {string} req.body.reason - Reason for the refund
 * @param {Object} res - Express response object
 * @returns {Object} Refund details
 */
export const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: amount ? amount * 100 : undefined, // Convert to cents if partial refund
      reason: reason
    });

    // Update payment status
    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = amount || payment.amount;
    payment.refundReason = reason;
    await payment.save();

    return res.status(200).json({
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100, // Convert back to dollars
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return res.status(500).json({ message: 'Refund processing failed' });
  }
};

/**
 * Webhook handler for Stripe events
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Stripe event object
 * @param {Object} res - Express response object
 * @returns {Object} Acknowledgement response
 */
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripeWebhookSecret
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      // Add more event handlers as needed
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Handles successful payment webhook event
 * @async
 * @private
 * @param {Object} paymentIntent - Stripe payment intent object
 */
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      payment.status = 'succeeded';
      await payment.save();

      // Update booking status
      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        booking.paymentStatus = 'paid';
        await booking.save();
      }
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

/**
 * Handles failed payment webhook event
 * @async
 * @private
 * @param {Object} paymentIntent - Stripe payment intent object
 */
const handlePaymentFailure = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      payment.status = 'failed';
      payment.failureReason = paymentIntent.last_payment_error?.message;
      await payment.save();

      // Update booking status
      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        booking.paymentStatus = 'failed';
        await booking.save();
      }
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};
