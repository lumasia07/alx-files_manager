const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
  static async postFile(req, res) {
    const {
      name, type, parentId, isPublic = false, data,
    } = req.body;
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId) {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const finalParentId = parentId || 0;

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    let localPath;
    let newFile;

    if (type === 'file' || type === 'image') {
      const fileName = crypto.randomUUID();
      localPath = path.join(folderPath, fileName);

      const buffer = Buffer.from(data, 'base64');
      fs.writeFileSync(localPath, buffer);

      newFile = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: finalParentId,
        localPath,
      };
    } else {
      newFile = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: finalParentId,
      };
    }

    const result = await dbClient.db.collection('files').insertOne(newFile);

    return res.status(201).json({
      id: result.insertedId,
      ...newFile,
    });
  }
}

module.exports = FilesController;
