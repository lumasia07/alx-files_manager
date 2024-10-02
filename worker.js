const Bull = require('bull');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs').promises;
const { ObjectId } = require('mongodb');
const dbClient = require('./utils/db');

const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.getFile({ _id: ObjectId(fileId), userId: ObjectId(userId) });

  if (!file) {
    throw new Error('File not found');
  }

  const sizes = [500, 250, 100];

  for (const width of sizes) {
    const thumbnailBuffer = await imageThumbnail(file.localPath, { width });
    const thumbnailPath = `${file.localPath}_${width}`;
    await fs.writeFile(thumbnailPath, thumbnailBuffer);
  }
});

userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const user = await dbClient.getUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);
});

module.exports = { fileQueue, userQueue };
