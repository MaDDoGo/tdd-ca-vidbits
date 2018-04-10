const { assert } = require('chai');

describe('User deleting video', () => {
  it('removes the Video from the list', () => {
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

    browser.submitForm('#delete-video');

    assert.equal(browser.getText('#videos-container'), '');
  });
});
