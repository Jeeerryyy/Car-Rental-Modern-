const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array();
  res.status(422).json({
    success: false,
    error: errors[0].msg,
    details: errors.map((e) => ({ field: e.path, message: e.msg })),
  });
}

module.exports = validate;
