const { paginationQuery, logDate } = require("./common.validator");

exports.list = {
  querystring: {
    type: "object",
    properties: {
      ...paginationQuery.properties,
      date: logDate,
      slowOnly: { type: "boolean" },
      minDurationMs: { type: "number", minimum: 0 },
      method: {
        type: "string",
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
      },
      route: { type: "string", maxLength: 255 }, // e.g. /api/v1/users/:id
      statusCode: { type: "integer" },
      clientId: { type: "integer", minimum: 1 },
    },
  },
};

exports.summary = {
  querystring: { type: "object", properties: { date: logDate } },
};
