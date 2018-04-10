const { assert } = require('chai');
const { connectDatabaseAndDropData, disconnectDatabase } = require('../database-utilities');

describe('User visiting landing page', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  it('can navigate to add a video', () => {
    browser.url('/');
    browser.click('#add-new-video-button');

    assert.include(browser.getText('body'), 'Save a video');
  });

  describe('with no existing videos', () => {
    it('shows no videos', () => {
      browser.url('/');

      assert.equal(browser.getText('#videos-container'), '');
    });
  });

  describe('with an existing video', () => {
    it('renders it in the list', () => {
      const itemToCreate = {
        title: 'New video',
        description: 'New video description',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      };

      browser.url('/videos/create');
      browser.setValue('#video-title-input', itemToCreate.title);
      browser.setValue('#video-description-input', itemToCreate.description);
      browser.setValue('#video-url-input', itemToCreate.videoUrl);
      browser.click('#submit-button');

      browser.url('/');
      assert.include(browser.getText('#videos-container'), itemToCreate.title);
    });

    it('can navigate to a video', () => {
      const itemToCreate = {
        title: 'New video',
        description: 'New video description',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      };

      browser.url('/videos/create');
      browser.setValue('#video-title-input', itemToCreate.title);
      browser.setValue('#video-description-input', itemToCreate.description);
      browser.setValue('#video-url-input', itemToCreate.videoUrl);
      browser.click('#submit-button');

      assert.include(browser.getText('body'), itemToCreate.title);
    });
  });
});
