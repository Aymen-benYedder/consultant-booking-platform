const { Policy } = require('../models/Policy.js');

// Create a new policy
const createPolicy = async (req, res) => {
  const { cancellationPolicy, reschedulePolicy } = req.body;

  try {
    const newPolicy = new Policy({
      consultantId: req.user._id,
      cancellationPolicy,
      reschedulePolicy,
    });

    await newPolicy.save();
    return res.status(201).json(newPolicy);
  } catch (error) {
    console.error('Error creating policy:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get a policy by consultant ID
const getPolicyByConsultantId = async (req, res) => {
  try {
    const policy = await Policy.findOne({ consultantId: req.params.consultantId });
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    return res.status(200).json(policy);
  } catch (error) {
    console.error('Error fetching policy:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing policy
const updatePolicy = async (req, res) => {
  const { cancellationPolicy, reschedulePolicy } = req.body;
  try {
    const policy = await Policy.findOneAndUpdate(
      { consultantId: req.user._id },
      { cancellationPolicy, reschedulePolicy },
      { new: true }
    );
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    return res.status(200).json(policy);
  } catch (error) {
    console.error('Error updating policy:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete a policy by consultant ID
const deletePolicy = async (req, res) => {
  const { consultantId } = req.params;

  try {
    const deletedPolicy = await Policy.findOneAndDelete({ consultantId });

    if (!deletedPolicy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    return res.status(200).json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting policy:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPolicy,
  getPolicyByConsultantId,
  updatePolicy,
  deletePolicy
};
