const { assert } = require('chai');

describe('User visiting new videos page', () => {
  it('can save a video', () => {
    const itemToCreate = {
      'video-title': 'New video',
      'video-description': 'New video description',
      'video-url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    };

    browser.url('/videos/create');

    browser.setValue('#video-title-input', itemToCreate['video-title']);
    browser.setValue('#video-description-input', itemToCreate['video-description']);
    browser.setValue('#video-url-input', itemToCreate['video-url']);
    browser.click('#submit-button');
  });
});
