const crypto = require('crypto');
const dbClient = require('../utils/db');


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

        res.status(201).json({
            id: final.insertedId,
            email: newUser.email,
        });
    } catch (error) {
        console.error('Error creating new user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = UsersController;