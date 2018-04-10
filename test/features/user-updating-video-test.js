const { assert } = require('chai');

describe('User updating video', () => {
  it('changes the values', () => {
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

    browser.click('#update-button');

    const updatedItems = {
      title: 'Updated video title',
      description: 'Updated video description',
    };

    browser.setValue('#video-title-input', updatedItems.title);
    browser.setValue('#video-description-input', updatedItems.description);
    browser.click('#submit-button');

    assert.equal(browser.getText('#video-title'), updatedItems.title);
    assert.equal(browser.getText('#video-description'), updatedItems.description);
  });

  it('does not create an additional video', () => {
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

    browser.click('#update-button');

    const updatedItems = {
      title: 'Updated video title',
      description: 'Updated video description',
    };

    browser.setValue('#video-title-input', updatedItems.title);
    browser.setValue('#video-description-input', updatedItems.description);
    browser.click('#submit-button');

    browser.url('/');
    assert.notInclude(browser.getText('#videos-container'), itemToCreate.title);
    assert.include(browser.getText('#videos-container'), updatedItems.title);
  });
});
