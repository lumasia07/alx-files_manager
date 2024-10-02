const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../server');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

chai.use(chaiHttp);
const { expect } = chai;

describe('aPI Endpoints', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gET /status should return status', () => new Promise((done) => {
    chai.request(app)
      .get('/status')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status', 'OK');
        done();
      });
  }));

  it('gET /stats should return stats', () => new Promise((done) => {
    chai.request(app)
      .get('/stats')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  }));

  it('pOST /users should create a user', () => new Promise((done) => {
    const newUser = { username: 'testUser', password: 'password123' };
    sinon.stub(dbClient, 'addUser').resolves(newUser);

    chai.request(app)
      .post('/users')
      .send(newUser)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.deep.equal(newUser);
        done();
      });
  }));

  it('gET /connect should return connect status', () => new Promise((done) => {
    chai.request(app)
      .get('/connect')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  }));

  it('gET /disconnect should return disconnect status', () => new Promise((done) => {
    chai.request(app)
      .get('/disconnect')
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Check response content
        done();
      });
  }));

  it('gET /users/me should return user data', () => new Promise((done) => {
    const token = 'sample_token';
    sinon.stub(redisClient, 'get').resolves('userId123');
    sinon.stub(dbClient, 'getUserById').resolves({ id: 'userId123', name: 'Test User' });

    chai.request(app)
      .get('/users/me')
      .set('x-token', token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('name', 'Test User');
        done();
      });
  }));

  it('pOST /files should upload a file', () => new Promise((done) => {
    const fileData = { name: 'testFile', type: 'file', data: 'fileData' };
    sinon.stub(dbClient, 'addFile').resolves(fileData);

    chai.request(app)
      .post('/files')
      .send(fileData)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.deep.equal(fileData);
        done();
      });
  }));

  it('gET /files/:id should return file data', () => new Promise((done) => {
    const fileId = 'fileId123';
    const fileData = { _id: fileId, name: 'testFile' };
    sinon.stub(dbClient, 'getFileById').resolves(fileData);

    chai.request(app)
      .get(`/files/${fileId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(fileData);
        done();
      });
  }));

  it('gET /files should return a list of files with pagination', () => new Promise((done) => {
    const files = [{ _id: 'fileId1', name: 'file1' }, { _id: 'fileId2', name: 'file2' }];
    sinon.stub(dbClient, 'getFiles').resolves(files);

    chai.request(app)
      .get('/files?page=0')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(files);
        done();
      });
  }));

  it('pUT /files/:id/publish should publish a file', () => new Promise((done) => {
    const fileId = 'fileId123';
    const updatedFile = { _id: fileId, isPublic: true };
    sinon.stub(dbClient, 'updateFile').resolves(updatedFile);

    chai.request(app)
      .put(`/files/${fileId}/publish`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(updatedFile);
        done();
      });
  }));

  it('pUT /files/:id/unpublish should unpublish a file', () => new Promise((done) => {
    const fileId = 'fileId123';
    const updatedFile = { _id: fileId, isPublic: false };
    sinon.stub(dbClient, 'updateFile').resolves(updatedFile);

    chai.request(app)
      .put(`/files/${fileId}/unpublish`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(updatedFile);
        done();
      });
  }));

  it('gET /files/:id/data should return file data', () => new Promise((done) => {
    const fileId = 'fileId123';
    const fileData = { _id: fileId, localPath: 'path/to/file' };
    sinon.stub(dbClient, 'getFile').resolves(fileData);

    chai.request(app)
      .get(`/files/${fileId}/data`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(fileData);
        done();
      });
  }));
});
