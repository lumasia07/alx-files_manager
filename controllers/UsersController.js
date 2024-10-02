const crypto = require('crypto');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { ObjectId } = require('mongodb');


class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const existingUser = await dbClient.db.collection('users').findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPwd = crypto.createHash('sha1').update(password).digest('hex');

      const newUser = {
        email,
        password: hashedPwd,
      };

      const final = await dbClient.db.collection('users').insertOne(newUser);

      return res.status(201).json({
        id: final.insertedId,
        email: newUser.email,
      });
    } catch (error) {
      console.error('Error creating new user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
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
  
      const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });
  
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      return res.status(200).json({
        id: user._id,
        email: user.email,
      });
    } catch (error) {
      console.error('Error retrieving user information:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = UsersController;
