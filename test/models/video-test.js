const { assert } = require('chai');
const { connectDatabaseAndDropData, disconnectDatabase } = require('../database-utilities');
const Video = require('../../models/video');

describe('Video model', () => {
  describe('#title', () => {
    it('is a String', () => {
      const titleAsInt = 12345;

      const video = new Video({ title: titleAsInt });

      assert.strictEqual(video.title, titleAsInt.toString());
    });
    it('is required', () => {
      const title = '';
      const videoWithoutTitle = { title };
      const video = new Video(videoWithoutTitle);

      video.validateSync();

      assert.equal(video.errors.title.message, 'Title is required');
    });
  });

  describe('#description', () => {
    it('should be string', () => {
      const descriptionAsInt = 12345;

      const video = new Video({ description: descriptionAsInt });

      assert.strictEqual(video.description, descriptionAsInt.toString());
    });
  });

  describe('#url', () => {
    it('is a String', () => {
      const url = 23;

      const video = new Video({ url });

      assert.strictEqual(video.url, url.toString());
    });
    it('is required', () => {
      const url = '';
      const videoWithoutTitle = { url };
      const video = new Video(videoWithoutTitle);

      video.validateSync();

      assert.equal(video.errors.url.message, 'URL is required');
    });
  });
});
