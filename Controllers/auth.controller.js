const AuthService = require("../Services/auth.service");
const Response = require("../Helpers/response.helper");

exports.login = async (request, reply) => {
  const data = await AuthService.login(request.body);
  return Response.success(reply, { data, message: "login successful" });
};

exports.refresh = async (request, reply) => {
  const data = await AuthService.refresh(request.body);
  return Response.success(reply, { data, message: "token refreshed" });
};

exports.logout = async (request, reply) => {
  await AuthService.logout(request.user.id);
  return Response.success(reply, { message: "logout successful" });
};
