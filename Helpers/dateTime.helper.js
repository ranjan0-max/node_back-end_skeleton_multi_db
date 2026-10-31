const IST_OPTIONS = { timeZone: "Asia/Kolkata" };

/**
 * @description current date / time in Indian Standard Time
 * @param type "date" | "time" | "datetime"
 * @returns string e.g. "28/10/2026", "10:21:05 pm"
 */
function IST(type = "datetime") {
  const now = new Date();

  if (type === "date") return now.toLocaleDateString("en-IN", IST_OPTIONS);
  if (type === "time") return now.toLocaleTimeString("en-IN", IST_OPTIONS);

  return now.toLocaleString("en-IN", IST_OPTIONS);
}

module.exports = { IST };
