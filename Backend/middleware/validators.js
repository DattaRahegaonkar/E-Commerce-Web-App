// Backend/middleware/validators.js
const { body, param, validationResult } = require('express-validator');

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
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
  checkValidationResults
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').not().isEmpty().withMessage('Password is required'),
  checkValidationResults
];

// Product validation
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
    .isIn(['Electronics', 'Clothing', 'Books', 'Home', 'Other']).withMessage('Invalid category'),
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
  validateProductId,
  checkValidationResults
};