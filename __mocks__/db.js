const db = {
  query: jest.fn(),
  pool: {
    connect: jest.fn()
  },
  testConnection: jest.fn().mockResolvedValue(true)
};

module.exports = db;
