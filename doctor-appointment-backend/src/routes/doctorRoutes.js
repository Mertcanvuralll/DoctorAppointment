const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/doctors:
 *   get:
 *     tags: 
 *       - Doctors
 *     summary: List all doctors
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         default: 10
 *         description: Number of items per page
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Doctor'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 50
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 */

// Public routes
router.get('/', doctorController.getAllDoctors);
router.get('/search', doctorController.searchDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:doctorId/reviews', doctorController.getDoctorReviews);

// Protected routes
router.post('/register', authMiddleware.protect, doctorController.register);
router.post('/', authMiddleware.protect, doctorController.createDoctor);
router.put('/:id', authMiddleware.protect, doctorController.updateDoctor);
router.delete('/:id', authMiddleware.protect, doctorController.deleteDoctor);

module.exports = router; 