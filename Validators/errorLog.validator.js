const { paginationQuery, logDate } = require("./common.validator");

exports.list = {
  querystring: {
    type: "object",
    properties: {
      ...paginationQuery.properties,
      date: logDate,
      source: { type: "string", enum: ["request", "uncaughtException", "unhandledRejection"] },
      clientId: { type: "integer", minimum: 1 },
      userId: { type: "integer", minimum: 1 },
    },
  },
};
