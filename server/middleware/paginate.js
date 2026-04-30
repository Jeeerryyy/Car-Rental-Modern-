function paginate(req, _res, next) {
  const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  req.pagination = { skip: (page - 1) * limit, limit, page };
  next();
}

module.exports = paginate;
