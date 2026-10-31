const { idParam, paginationQuery } = require("./common.validator");
const { ROLES } = require("../Helpers/constants.helper");

exports.list = {
  querystring: paginationQuery,
};

exports.getById = {
  params: idParam,
};

exports.create = {
  body: {
    type: "object",
    required: ["email", "password"],
    additionalProperties: false,
    properties: {
      name: { type: "string", minLength: 2, maxLength: 100 },
      email: { type: "string", format: "email", maxLength: 150 },
      password: { type: "string", minLength: 8, maxLength: 72 },
      role: { type: "string", enum: [ROLES.ADMIN, ROLES.USER], default: ROLES.USER },
    },
  },
};
