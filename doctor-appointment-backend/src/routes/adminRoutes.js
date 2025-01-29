const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes should be protected
router.use(protect); // Authentication is required for all admin routes
router.use(authorize('admin')); // Only admin users can access

router.get('/pending-doctors', adminController.getPendingDoctors);
router.put('/doctors/:doctorId/approve', adminController.approveDoctor);
router.put('/doctors/:doctorId/reject', adminController.rejectDoctor);
router.get('/all-doctors', adminController.getAllDoctors);
router.get('/all-users', adminController.getAllUsers);

// Optional: New middleware for checking admin role
const checkAdminRole = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
};

// Use both middleware for routes requiring admin role
router.get('/dashboard', [protect, checkAdminRole], adminController.getDashboardStats);

module.exports = router; 