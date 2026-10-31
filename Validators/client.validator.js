const { paginationQuery } = require("./common.validator");

exports.list = {
  querystring: paginationQuery,
};

exports.create = {
  body: {
    type: "object",
    required: ["name", "slug", "adminEmail", "adminPassword"],
    additionalProperties: false,
    properties: {
      name: { type: "string", minLength: 2, maxLength: 150 },
      //? slug becomes schema name (tenant_<slug>) -> only lowercase letters, numbers, _
      slug: { type: "string", pattern: "^[a-z][a-z0-9_]{2,39}$" },
      adminName: { type: "string", minLength: 2, maxLength: 100 },
      adminEmail: { type: "string", format: "email", maxLength: 150 },
      adminPassword: { type: "string", minLength: 8, maxLength: 72 },
    },
  },
};
