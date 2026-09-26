// Backend/middleware/validators.js
const { body, param, validationResult } = require('express-validator');

const VALID_CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Other'];

// Reusable validation results middleware
const checkValidationResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors in a more frontend-friendly way
    const errorMessages = errors.array().map(err => err.msg);
    return res.status(400).json({
      message: errorMessages[0], // First error message for simple display
      errors: errorMessages // All error messages
    });
  }
  next();
};

const validateSignup = [
  body('name').trim().not().isEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  checkValidationResults
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').not().isEmpty().withMessage('Password is required'),
  checkValidationResults
];

// Validation for creating a new product — all fields required, category strictly validated
const validateProduct = [
  body('name')
    .trim()
    .not().isEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .custom((value) => value >= 0).withMessage('Price cannot be negative'),
  body('category')
    .trim()
    .not().isEmpty().withMessage('Category is required')
    .isIn(VALID_CATEGORIES).withMessage('Invalid category'),
  body('company')
    .trim()
    .not().isEmpty().withMessage('Company name is required'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock cannot be negative'),
  checkValidationResults
];

// Validation for updating a product — category is optional; only validate it if provided
const validateProductUpdate = [
  body('name')
    .trim()
    .not().isEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .custom((value) => value >= 0).withMessage('Price cannot be negative'),
  body('category')
    .optional()
    .trim()
    .isIn(VALID_CATEGORIES).withMessage('Invalid category'),
  body('company')
    .trim()
    .not().isEmpty().withMessage('Company name is required'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock cannot be negative'),
  checkValidationResults
];

// Product ID validation
const validateProductId = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  checkValidationResults
];

module.exports = {
  validateSignup,
  validateLogin,
  validateProduct,
  validateProductUpdate,
  validateProductId,
  checkValidationResults
};
