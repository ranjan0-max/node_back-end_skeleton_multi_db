const ErrorLogService = require("../Services/errorLog.service");
const Response = require("../Helpers/response.helper");

exports.list = async (request, reply) => {
  const { rows, count } = await ErrorLogService.list(request.query);
  return Response.success(reply, { data: rows, count });
};

exports.dates = async (request, reply) => {
  const data = await ErrorLogService.dates();
  return Response.success(reply, { data, count: data.length });
};
