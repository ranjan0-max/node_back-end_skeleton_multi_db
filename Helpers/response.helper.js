// SUCCESS RESPONSE
exports.success = (reply, data = {}) => {
  return reply.code(data.status || 200).send({
    success: true,
    data: data.data || {},
    count: data.count || 0,
    message: data.message || "data sent",
  });
};

// CREATED RESPONSE
exports.created = (reply, data = {}) => {
  return reply.code(201).send({
    success: true,
    data: data.data || {},
    count: data.count || 0,
    message: data.message || "data created",
  });
};

// ERROR RESPONSE
exports.error = (reply, data = {}) => {
  return reply.code(data.status || 500).send({
    success: false,
    data: data.data || {},
    message: data.message || "Oops! something went wrong",
  });
};

// UNAUTHORIZED RESPONSE
exports.unauthorized = (reply, data = {}) => {
  return reply.code(data.status || 401).send({
    success: false,
    data: data.data || {},
    message: data.message || "unauthorized",
  });
};

// FORBIDDEN RESPONSE
exports.forbidden = (reply, data = {}) => {
  return reply.code(data.status || 403).send({
    success: false,
    data: data.data || {},
    message: data.message || "Forbidden",
  });
};

// BADREQUEST RESPONSE
exports.badRequest = (reply, data = {}) => {
  return reply.code(data.status || 400).send({
    success: false,
    data: data.data || {},
    message: data.message || "Bad Request",
  });
};

// NOT FOUND RESPONSE
exports.notFound = (reply, data = {}) => {
  return reply.code(data.status || 404).send({
    success: false,
    data: data.data || {},
    message: data.message || "Not Found",
  });
};
