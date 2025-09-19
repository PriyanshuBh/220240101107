const { v4: uuidv4 } = require("uuid");

function generateCode() {
  return uuidv4().replace(/-/g, "").substring(0, 8);  
}

module.exports = generateCode;
