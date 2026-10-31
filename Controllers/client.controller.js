const ClientService = require("../Services/client.service");
const Response = require("../Helpers/response.helper");

exports.list = async (request, reply) => {
  const { rows, count } = await ClientService.list(request.query);
  return Response.success(reply, { data: rows, count });
};

exports.create = async (request, reply) => {
  const data = await ClientService.createClient(request.body);
  return Response.created(reply, { data, message: "client created" });
};
