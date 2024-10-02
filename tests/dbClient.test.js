const chai = require('chai');
const sinon = require('sinon');
const dbClient = require('../utils/db');

const { expect } = chai;

describe('dB Client', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should add a file', async () => {
    const newFile = { name: 'testFile', userId: '12345' };

    sinon.stub(dbClient, 'addFile').resolves(newFile);

    const result = await dbClient.addFile(newFile);
    expect(result).to.deep.equal(newFile);
  });

  it('should get a file by ID', async () => {
    const fileId = '605c72f8f0c3a44e53e6b874';
    const file = { _id: fileId, name: 'testFile' };

    sinon.stub(dbClient, 'getFileById').resolves(file);

    const result = await dbClient.getFileById(fileId);
    expect(result).to.deep.equal(file);
  });
});
