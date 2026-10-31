exports.login = {
  body: {
    type: "object",
    required: ["email", "password"],
    additionalProperties: false,
    properties: {
      email: { type: "string", format: "email", maxLength: 150 },
      password: { type: "string", minLength: 1, maxLength: 72 },
    },
  },
};

exports.refresh = {
  body: {
    type: "object",
    required: ["refreshToken"],
    additionalProperties: false,
    properties: { refreshToken: { type: "string", minLength: 1 } },
  },
};
