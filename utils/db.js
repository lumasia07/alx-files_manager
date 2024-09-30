const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = 'localhost';
    const port = 27017;
    const database = 'files_manager';

    // MongoDB connection URL
    const url = `mongodb://${host}:${port}`;

    // Instantiate MongoClient
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.db = null;

    // Attempt connection to MongoDB
    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
        console.log('Successfully connected to MongoDB');
      })
      .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
      });
  }

  // Check if the MongoDB client is connected
  isAlive() {
    return this.client && this.client.isConnected && this.client.topology.isConnected();
  }

  // Count the number of documents in the 'users' collection
  async nbUsers() {
    try {
      return await this.db.collection('users').countDocuments();
    } catch (error) {
      console.error('Error fetching number of users:', error);
      return 0;
    }
  }

  // Count the number of documents in the 'files' collection
  async nbFiles() {
    try {
      return await this.db.collection('files').countDocuments();
    } catch (error) {
      console.error('Error fetching number of files:', error);
      return 0;
    }
  }
}

// Export an instance of DBClient
const dbClient = new DBClient();
module.exports = dbClient;
