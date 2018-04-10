const { assert } = require('chai');
const request = require('supertest');
const { parseTextFromHTML, parseValueFromHTML } = require('../utils/index');

const app = require('../../app');
const { connectDatabaseAndDropData, disconnectDatabase } = require('../database-utilities');

const Video = require('../../models/video');

const getVideoObject = () => ({
  'video-title': 'New video',
  'video-description': 'New video description',
  'video-url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
});

const getTitlessObject = () => ({ 'video-url': 'http://google.com' });

const getUrlessObject = () => ({ 'video-title': 'Valid title' });

const getDBObject = () => ({
  title: 'New video',
  description: 'New video description',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
});

const seedVideosDB = async (obj = getDBObject()) => Video.create(obj);

const createVideoRequest = async (videoToCreate = {}) => request(app)
  .post('/videos')
  .type('form')
  .send(videoToCreate);

describe('/videos', async () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('GET', () => {
    it('renders existing Videos', async () => {
      const newVideo = await seedVideosDB();

      const response = await request(app)
        .get('/videos');

      assert.include(response.text, newVideo.title);
    });
  });

  describe('POST', async () => {
    it('responses with a 302 status code', async () => {
      const response = await createVideoRequest(getVideoObject());

      assert.equal(response.status, 302);
    });

    it('redirects to the new Video show page', async () => {
      const response = await createVideoRequest(getVideoObject());

      assert.include(response.header.location, 'videos/');
    });

    it('saves a Video document', async () => {
      const newVideo = getVideoObject();
      const response = await createVideoRequest(newVideo);

      const createdVideo = await Video.findOne({ title: newVideo['video-title'] });
      assert.equal(createdVideo.title, newVideo['video-title']);
    });

    describe('when the title is missing ', () => {
      it('does not save the video', async () => {
        const response = await createVideoRequest({ });

        const listVideos = await Video.find({ });
        assert.equal(listVideos.length, []);
      });

      it('responds with a 400', async () => {
        const response = await createVideoRequest({ });

        assert.equal(response.status, 400);
      });

      it('renders the video form', async () => {
        let response = await createVideoRequest(getTitlessObject());

        assert.equal(response.status, 400);
        assert.include(response.text, 'Save a video');
      });

      it('renders the validation error message', async () => {
        let response = await createVideoRequest(getTitlessObject());
        
        assert.equal(response.status, 400);
        assert.include(response.text, 'Title is required');
      });

      it('preserves the other field values', async () => {
        const titlessObject = getTitlessObject();
        let response = await createVideoRequest(titlessObject);
        
        assert.equal(response.status, 400);
        assert.include(parseValueFromHTML(response.text, 'input[name="video-url"]'), titlessObject['video-url']);
      });
    });

    describe('when the URL is missing', () => {
      it('renders the validation error message', async () => {
        let response = await createVideoRequest(getUrlessObject());
        
        assert.equal(response.status, 400);
        assert.include(response.text, 'URL is required');
      });

      it('preserves the other field values', async () => {
        const urllessObject = getUrlessObject();
        let response = await createVideoRequest(urllessObject);
        
        assert.equal(response.status, 400);
        assert.include(parseValueFromHTML(response.text, 'input[name="video-title"]'), urllessObject['video-title']);
      });
    });
  });
});

describe('/videos/:id', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('/GET', () => {
    it('renders the video', async () => {
      const newVideo = getDBObject();
      const createdVideo = await seedVideosDB(newVideo);

      const response = await request(app)
        .get(`/videos/${createdVideo._id}`);

      assert.include(response.text, newVideo.title);
      assert.include(response.text, newVideo.url);
      assert.include(response.text, newVideo.description);
    });
  });

  describe('POST', () => {
    it('updates the record', async () => {
      const newVideo = getDBObject();
      const createdVideo = await seedVideosDB(newVideo);
      const updatedVideo = Object.assign({ }, newVideo, { title: 'Updated title' });

      let response = await request(app)
        .post(`/videos/${createdVideo._id}`)
        .type('form')
        .send({
          'video-url': updatedVideo.url,
          'video-description': updatedVideo.description,
          'video-title': updatedVideo.title,
        });

      assert.equal(response.status, 302);

      response = await request(app).get(response.headers.location);

      assert.include(response.text, updatedVideo.title);
      assert.include(response.text, updatedVideo.url);
      assert.include(response.text, updatedVideo.description);
    });

    it('redirects to the show page', async () => {
      const newVideo = getDBObject();
      const createdVideo = await seedVideosDB(newVideo);
      const updatedVideo = Object.assign({ }, newVideo, { title: 'Updated title' });

      let response = await request(app)
        .post(`/videos/${createdVideo._id}`)
        .type('form')
        .send({
          'video-url': updatedVideo.url,
          'video-description': updatedVideo.description,
          'video-title': updatedVideo.title,
        });

      assert.equal(response.status, 302);

      response = await request(app).get(response.headers.location);
    });

    describe('when the record is invalid', () => {
      it('does not save the record', async () => {
        const newVideo = getDBObject();
        const createdVideo = await seedVideosDB(newVideo);
        const updatedVideo = Object.assign({ }, newVideo, { title: 'Updated title' });

        let response = await request(app)
          .post(`/videos/${createdVideo._id}`)
          .type('form')
          .send({
            'video-description': updatedVideo.description,
            'video-title': updatedVideo.title,
          });

        assert.equal(response.status, 400);

        const notUpdated = await Video.findOne({ _id: createdVideo._id });

        assert.equal(createdVideo.title, notUpdated.title);
      });

      it('responds with a 400', async () => {
        const newVideo = getDBObject();
        const createdVideo = await seedVideosDB(newVideo);
        const updatedVideo = Object.assign({ }, newVideo, { title: 'Updated title' });

        let response = await request(app)
          .post(`/videos/${createdVideo._id}`)
          .type('form')
          .send({
            'video-description': updatedVideo.description,
            'video-title': updatedVideo.title,
          });

        assert.equal(response.status, 400);
      });

      it('renders the Edit form', async () => {
        const newVideo = getDBObject();
        const createdVideo = await seedVideosDB(newVideo);
        const updatedVideo = Object.assign({ }, newVideo, { title: 'Updated title' });

        let response = await request(app)
          .post(`/videos/${createdVideo._id}`)
          .type('form')
          .send({
            'video-description': updatedVideo.description,
            'video-title': updatedVideo.title,
          });

        assert.equal(response.status, 400);
        assert.include(response.text, 'Save a video');
      });
    });
  });
});

describe('/videos/:id/edit', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('GET', () => {
    it('renders a form for the video', async () => {
      const newVideo = getDBObject();
      const createdVideo = await seedVideosDB(newVideo);

      const response = await request(app)
        .get(`/videos/${createdVideo._id}/edit`);

      assert.include(parseValueFromHTML(response.text, '#video-title-input'), newVideo.title);
      assert.include(parseValueFromHTML(response.text, '#video-url-input'), newVideo.url);
      assert.include(parseTextFromHTML(response.text, '#video-description-input'), newVideo.description);
    });
  });
});

describe('/videos/:id/delete', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('POST', () => {
    it('removes the record', async () => {
      const newVideo = getDBObject();
      const createdVideo = await seedVideosDB(newVideo);

      const response = await request(app)
        .post(`/videos/${createdVideo._id}/delete`).type('form').send({});

      const video = await Video.find({ _id: createdVideo._id });

      assert.isEmpty(video);
    });

    it('redirects to the landing page', async () => {
      const newVideo = getDBObject();
      const createdVideo = await seedVideosDB(newVideo);

      const response = await request(app)
        .post(`/videos/${createdVideo._id}/delete`).type('form').send({});

      assert.equal(response.status, 302);
      assert.include(response.header.location, 'videos');
    });
  });
});
