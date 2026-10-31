const idParam = {
  type: "object",
  required: ["id"],
  properties: { id: { type: "integer", minimum: 1 } },
};

const paginationQuery = {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 1, default: 1 },
    limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
  },
};

//? strict YYYY-MM-DD -> no one can read other files with "../"
const logDate = { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" };

module.exports = { idParam, paginationQuery, logDate };
