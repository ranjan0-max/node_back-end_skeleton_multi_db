const UserService = require("../Services/user.service");
const Response = require("../Helpers/response.helper");

exports.list = async (request, reply) => {
  const { clientId } = request.user;
  const { rows, count } = await UserService.list({ clientId, ...request.query });
  return Response.success(reply, { data: rows, count });
};

exports.getById = async (request, reply) => {
  const { clientId } = request.user;
  const data = await UserService.getById({ clientId, id: request.params.id });
  return Response.success(reply, { data });
};

exports.create = async (request, reply) => {
  const { clientId } = request.user;
  const data = await UserService.createUser({ clientId, ...request.body });
  return Response.created(reply, { data, message: "user created" });
};
