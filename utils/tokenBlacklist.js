const blacklistedTokens = new Set();

const addToken = (token) => blacklistedTokens.add(token);
const isBlacklisted = (token) => blacklistedTokens.has(token);

module.exports = { addToken, isBlacklisted };