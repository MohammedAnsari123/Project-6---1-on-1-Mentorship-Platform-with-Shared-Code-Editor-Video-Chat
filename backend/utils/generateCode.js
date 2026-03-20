const crypto = require('crypto');

const generateSessionCode = () => {
    // Generate a code like "abc-def-ghi"
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const part = () => Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${part()}-${part()}-${part()}`;
};

module.exports = generateSessionCode;
