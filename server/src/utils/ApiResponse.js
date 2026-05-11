export class ApiResponse {
  static success(res, statusCode = 200, message = 'Success', data = null, pagination = null, extra = {}) {
    const response = {
      success: true,
      message,
      data,
      ...extra
    };
    if (pagination) {
      response.pagination = pagination;
    }
    return res.status(statusCode).json(response);
  }

  static error(res, statusCode = 400, message = 'Error', code = null, errors = null) {
    const response = {
      success: false,
      message
    };
    if (code) response.code = code;
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }
}

export default ApiResponse;
