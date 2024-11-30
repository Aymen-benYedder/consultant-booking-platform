/**
 * Search Controller
 * Handles all search-related operations including consultant search,
 * service search, and advanced filtering options.
 * 
 * @module controllers/searchController
 * @requires models/Consultant
 * @requires models/User
 */

import Consultant from '../models/Consultant.js';
import User from '../models/User.js';

/**
 * Searches for consultants based on various criteria
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.q] - Search query for name or specialty
 * @param {string[]} [req.query.services] - Array of service types
 * @param {number} [req.query.minRating] - Minimum rating filter
 * @param {number} [req.query.maxPrice] - Maximum price filter
 * @param {string} [req.query.availability] - Availability filter (e.g., "weekend", "weekday")
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Number of results per page
 * @param {Object} res - Express response object
 * @returns {Object} Paginated list of consultants matching criteria
 */
export const searchConsultants = async (req, res) => {
  try {
    const {
      q,
      services,
      minRating,
      maxPrice,
      availability,
      page = 1,
      limit = 10
    } = req.query;

    // Build search query
    const query = {};

    // Text search on name or specialty
    if (q) {
      query.$or = [
        { 'userId.name': { $regex: q, $options: 'i' } },
        { 'userId.specialty': { $regex: q, $options: 'i' } }
      ];
    }

    // Filter by services
    if (services) {
      const serviceArray = Array.isArray(services) ? services : [services];
      query.services = { $in: serviceArray };
    }

    // Filter by rating
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Filter by price
    if (maxPrice) {
      query['services.price'] = { $lte: parseFloat(maxPrice) };
    }

    // Filter by availability
    if (availability) {
      query[`availability.${availability}`] = true;
    }

    // Execute search with pagination
    const skip = (page - 1) * limit;
    const consultants = await Consultant.find(query)
      .populate('userId', 'name email avatar specialty description')
      .sort({ averageRating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Consultant.countDocuments(query);

    return res.status(200).json({
      consultants,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching consultants:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Searches for available services
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.q] - Search query for service name
 * @param {Object} res - Express response object
 * @returns {Object} List of unique services and their stats
 */
export const searchServices = async (req, res) => {
  try {
    const { q } = req.query;

    // Aggregate pipeline to get unique services and their stats
    const pipeline = [
      { $unwind: '$services' },
      {
        $group: {
          _id: '$services.type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$services.price' },
          minPrice: { $min: '$services.price' },
          maxPrice: { $max: '$services.price' },
          consultants: { $addToSet: '$_id' }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: 1,
          maxPrice: 1,
          consultantCount: { $size: '$consultants' },
          _id: 0
        }
      }
    ];

    // Add text search if query provided
    if (q) {
      pipeline.unshift({
        $match: {
          'services.type': { $regex: q, $options: 'i' }
        }
      });
    }

    const services = await Consultant.aggregate(pipeline);

    return res.status(200).json(services);
  } catch (error) {
    console.error('Error searching services:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Gets suggested consultants based on user preferences and history
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Array} List of suggested consultants
 */
export const getSuggestedConsultants = async (req, res) => {
  try {
    // Get user's booking history and preferences
    const userBookings = await Booking.find({ clientId: req.user._id })
      .populate('consultantId')
      .sort({ createdAt: -1 })
      .limit(5);

    // Extract service types and successful consultants
    const serviceTypes = new Set();
    const successfulConsultants = new Set();
    userBookings.forEach(booking => {
      if (booking.status === 'completed' && booking.rating >= 4) {
        serviceTypes.add(booking.serviceType);
        successfulConsultants.add(booking.consultantId._id.toString());
      }
    });

    // Find similar consultants
    const suggestions = await Consultant.find({
      $and: [
        { _id: { $nin: Array.from(successfulConsultants) } },
        {
          $or: [
            { 'services.type': { $in: Array.from(serviceTypes) } },
            { averageRating: { $gte: 4.5 } }
          ]
        }
      ]
    })
    .populate('userId', 'name email avatar specialty description')
    .sort({ averageRating: -1 })
    .limit(10);

    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error getting suggested consultants:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Gets trending consultants based on recent bookings and ratings
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} List of trending consultants
 */
export const getTrendingConsultants = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingConsultants = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$consultantId',
          bookingCount: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $match: {
          bookingCount: { $gte: 5 },
          avgRating: { $gte: 4 }
        }
      },
      {
        $sort: {
          bookingCount: -1,
          avgRating: -1
        }
      },
      {
        $limit: 10
      }
    ]);

    // Populate consultant details
    const consultantIds = trendingConsultants.map(item => item._id);
    const consultants = await Consultant.find({ _id: { $in: consultantIds } })
      .populate('userId', 'name email avatar specialty description');

    // Merge booking stats with consultant details
    const result = consultants.map(consultant => {
      const stats = trendingConsultants.find(
        item => item._id.toString() === consultant._id.toString()
      );
      return {
        ...consultant.toObject(),
        recentBookings: stats.bookingCount,
        recentRating: stats.avgRating
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error getting trending consultants:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
