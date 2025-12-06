import app from '../backend/server.cjs';

// Vercel serverless function handler
export default (req, res) => {
  return app(req, res);
};
