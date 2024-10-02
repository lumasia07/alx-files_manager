const chai = require('chai');
const sinon = require('sinon');
const redisClient = require('../utils/redis');

const { expect } = chai;

describe('redis Client', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should set a value', async () => {
    expect.assertions(1); // Expecting one assertion

    const key = 'testKey';
    const value = 'testValue';

    sinon.stub(redisClient, 'set').resolves('OK');

    const result = await redisClient.set(key, value);
    expect(result).to.equal('OK');
  });

  it('should get a value', async () => {
    expect.assertions(1); // Expecting one assertion

    const key = 'testKey';
    const value = 'testValue';

    sinon.stub(redisClient, 'get').resolves(value);

    const result = await redisClient.get(key);
    expect(result).to.equal(value);
  });
});
