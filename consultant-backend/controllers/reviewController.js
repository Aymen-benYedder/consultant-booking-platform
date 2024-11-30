/**
 * Review Controller
 * Handles all review-related operations including creation,
 * retrieval, and management of consultant reviews.
 * 
 * @module controllers/reviewController
 * @requires models/Review
 * @requires models/Booking
 * @requires models/Consultant
 */

import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Consultant from '../models/Consultant.js';

/**
 * Creates a new review for a completed booking
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.bookingId - ID of the completed booking
 * @param {number} req.body.rating - Rating value (1-5)
 * @param {string} req.body.comment - Review comment
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Created review
 */
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Cannot review a booking that is not completed' 
      });
    }

    // Check if user has already reviewed this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this booking' 
      });
    }

    // Create the review
    const review = new Review({
      bookingId,
      consultantId: booking.consultantId,
      clientId: req.user._id,
      rating,
      comment
    });

    await review.save();

    // Update consultant's average rating
    await updateConsultantRating(booking.consultantId);

    return res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Updates an existing review
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.reviewId - ID of the review to update
 * @param {Object} req.body - Request body
 * @param {number} [req.body.rating] - Updated rating value (1-5)
 * @param {string} [req.body.comment] - Updated review comment
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated review
 */
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Verify user owns the review
    if (review.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to update this review' 
      });
    }

    // Update review fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    review.updatedAt = Date.now();

    await review.save();

    // Update consultant's average rating
    await updateConsultantRating(review.consultantId);

    return res.status(200).json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Deletes a review
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.reviewId - ID of the review to delete
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Verify user owns the review or is admin
    if (review.clientId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to delete this review' 
      });
    }

    await review.remove();

    // Update consultant's average rating
    await updateConsultantRating(review.consultantId);

    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves reviews for a specific consultant
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.consultantId - ID of the consultant
 * @param {Object} res - Express response object
 * @returns {Array} List of consultant reviews
 */
export const getConsultantReviews = async (req, res) => {
  try {
    const { consultantId } = req.params;

    const reviews = await Review.find({ consultantId })
      .populate('clientId', 'name avatar')
      .populate('bookingId', 'serviceType date')
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching consultant reviews:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves reviews by the authenticated client
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Array} List of client's reviews
 */
export const getClientReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ clientId: req.user._id })
      .populate('consultantId', 'userId')
      .populate('bookingId', 'serviceType date')
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching client reviews:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Updates a consultant's average rating
 * @async
 * @private
 * @param {string} consultantId - ID of the consultant
 */
const updateConsultantRating = async (consultantId) => {
  try {
    const reviews = await Review.find({ consultantId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      await Consultant.findByIdAndUpdate(consultantId, {
        averageRating,
        totalReviews: reviews.length
      });
    } else {
      // Reset rating if no reviews
      await Consultant.findByIdAndUpdate(consultantId, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating consultant rating:', error);
    throw error;
  }
};
