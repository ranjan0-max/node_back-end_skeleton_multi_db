const { idParam } = require("./common.validator");

const menuProperties = {
  parentId: { type: ["integer", "null"], minimum: 1 }, // null = top level / group
  //? key used by frontend to identify menu e.g. "users.list"
  key: { type: "string", pattern: "^[a-z][a-z0-9_.-]{1,99}$" },
  title: { type: "string", minLength: 1, maxLength: 100 },
  icon: { type: ["string", "null"], maxLength: 100 },
  path: { type: ["string", "null"], maxLength: 255 },
  sortOrder: { type: "integer" },
  isActive: { type: "boolean" },
};

exports.getById = {
  params: idParam,
};

exports.create = {
  body: {
    type: "object",
    required: ["key", "title"],
    additionalProperties: false,
    properties: menuProperties,
  },
};

exports.update = {
  params: idParam,
  body: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    properties: menuProperties,
  },
};

exports.remove = {
  params: idParam,
};

//? /clients/:id/menus
exports.getClientMenus = {
  params: idParam,
};

exports.setClientMenus = {
  params: idParam,
  body: {
    type: "object",
    required: ["menuIds"],
    additionalProperties: false,
    properties: {
      //? full list -> replaces old mapping, [] = remove all menus of client
      menuIds: {
        type: "array",
        uniqueItems: true,
        maxItems: 500,
        items: { type: "integer", minimum: 1 },
      },
    },
  },
};
