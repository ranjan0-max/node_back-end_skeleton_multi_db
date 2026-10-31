const RequestLogService = require("../Services/requestLog.service");
const Response = require("../Helpers/response.helper");

exports.list = async (request, reply) => {
  const { rows, count } = await RequestLogService.list(request.query);
  return Response.success(reply, { data: rows, count });
};

exports.summary = async (request, reply) => {
  const data = await RequestLogService.summary(request.query);
  return Response.success(reply, { data, count: data.length });
};

exports.dates = async (request, reply) => {
  const data = await RequestLogService.dates();
  return Response.success(reply, { data, count: data.length });
};
