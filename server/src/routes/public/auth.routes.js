import { Router } from 'express';
import { register, login, googleAuth, getProfile, updateProfile, changePassword, logout, forgotPassword, resetPassword } from '../../controllers/customer.auth.controller.js';
import { registerRules, loginRules } from '../../validators/customer.auth.validator.js';
import { validate } from '../../middleware/validate.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Register a new customer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Test@1234
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: customerToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; SameSite=Strict
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login as customer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current customer profile
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Customer profile data
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), getProfile);
router.get('/profile', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), getProfile);
router.put('/profile', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), updateProfile);
router.post('/change-password', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), changePassword);
router.post('/logout', protect, restrictTo(USER_ROLES.CUSTOMER, USER_ROLES.OWNER), logout);

export default router;
