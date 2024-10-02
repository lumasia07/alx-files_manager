const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header exists and uses Basic auth
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Decode the base64 credentials
    const base64cred = authHeader.split(' ')[1];
    const creds = Buffer.from(base64cred, 'base64').toString('ascii');
    const [email, password] = creds.split(':');

    // Check if both email and password are provided
    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Hash the password using SHA1
    const hashedPwd = crypto.createHash('sha1').update(password).digest('hex');

    try {
      // Find the user in the database using the hashed password
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPwd });

      // If the user is not found, return an unauthorized error
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a token using UUIDv4
      const token = uuidv4();
      const key = `auth_${token}`;

      // Cache the user's ID in Redis for 24 hours (86400 seconds)
      await redisClient.set(key, user._id.toString(), 86400);

      // Return the generated token
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error during authentication:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['X-Token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;

    try {
      const userId = await redisClient.get(key);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete the token from Redis to sign the user out
      await redisClient.del(key);

      return res.status(204).send();
    } catch (error) {
      console.error('Error during disconnection:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;
