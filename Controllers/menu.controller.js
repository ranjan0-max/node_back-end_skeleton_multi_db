const MenuService = require("../Services/menu.service");
const Response = require("../Helpers/response.helper");

exports.my = async (request, reply) => {
  const data = await MenuService.getMyMenus(request.user);
  return Response.success(reply, { data });
};

exports.list = async (request, reply) => {
  const data = await MenuService.list();
  return Response.success(reply, { data });
};

exports.getById = async (request, reply) => {
  const data = await MenuService.getById(request.params.id);
  return Response.success(reply, { data });
};

exports.create = async (request, reply) => {
  const data = await MenuService.createMenu(request.body);
  return Response.created(reply, { data, message: "menu created" });
};

exports.update = async (request, reply) => {
  const data = await MenuService.updateMenu(request.params.id, request.body);
  return Response.success(reply, { data, message: "menu updated" });
};

exports.remove = async (request, reply) => {
  await MenuService.removeMenu(request.params.id);
  return Response.success(reply, { message: "menu deleted" });
};

exports.getClientMenus = async (request, reply) => {
  const menuIds = await MenuService.getClientMenuIds(request.params.id);
  return Response.success(reply, { data: { menuIds }, count: menuIds.length });
};

exports.setClientMenus = async (request, reply) => {
  const menuIds = await MenuService.setClientMenus(request.params.id, request.body.menuIds);
  return Response.success(reply, {
    data: { menuIds },
    count: menuIds.length,
    message: "client menus updated",
  });
};
