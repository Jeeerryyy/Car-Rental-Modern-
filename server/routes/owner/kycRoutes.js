const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');
const { ownerProtect } = require('../../middleware/auth');

router.get('/', ownerProtect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [customers, total] = await Promise.all([
      Customer.find({ idVerificationStatus: 'pending' })
        .select('name email idDocument createdAt')
        .skip(skip)
        .limit(limit),
      Customer.countDocuments({ idVerificationStatus: 'pending' })
    ]);
    
    res.json({ 
      success: true, 
      data: customers,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch KYC queue' });
  }
});

router.put('/:customerId/approve', ownerProtect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    customer.idVerificationStatus = 'approved';
    customer.idVerifiedAt = new Date();
    await customer.save();
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to approve KYC' });
  }
});

router.put('/:customerId/reject', ownerProtect, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason required' });
    }
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    customer.idVerificationStatus = 'rejected';
    customer.kycRejectionReason = rejectionReason;
    await customer.save();
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reject KYC' });
  }
});

module.exports = router;