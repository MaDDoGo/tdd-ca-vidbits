const express = require('express');

const router = express.Router();
const Video = require('../models/video');
const { URL } = require('url');

router.get('/', async (req, res) => {
  const videos = await Video.find({});
  res.render('videos/index', { videos });
});

router.post('/', async (req, res) => {
  let newVideo;
  try {
    newVideo = {
      title: req.body['video-title'],
      description: req.body['video-description'],
      url: req.body['video-url'],
    };

    try {
      newVideo.url = new URL(newVideo.url).href;
    } catch (e) {
      throw new Error('URL is required');
    }

    const savedVideo = new Video(newVideo);
    savedVideo.validateSync();
    if (savedVideo.errors) {
      const errorString = Object.keys(savedVideo.errors).map(error => savedVideo.errors[error].message);
      throw new Error(errorString.join('/n'));
    }

    await savedVideo.save();

    return res.redirect(`videos/${savedVideo._id}`);
  } catch (e) {
    return res.status(400).render('videos/create', {
      error: e.message,
      video: newVideo,
    });
  }
});

router.get('/create', async (req, res) => {
  res.render('videos/create');
});

router.get('/:id', async (req, res, next) => {
  if (!req.params.id) return res.redirect('/videos');

  try {
    const video = await Video.findById(req.params.id);
    if (video) {
      res.render('videos/show', { video });
    } else {
      res.redirect('/videos');
    }
  } catch (e) {
    res.redirect('/videos');
  }
});

router.get('/:id/edit', async (req, res) => {
  if (!req.params.id) return res.render('videos/create');

  try {
    const video = await Video.findById(req.params.id);
    if (video) {
      res.render('videos/create', { video });
    } else {
      res.render('videos/create');
    }
  } catch (e) {
    res.render('videos/create');
  }
});

router.post('/:id', async (req, res, next) => {
  const {
    'video-title': title,
    'video-description': description,
    'video-url': url,
  } = req.body;
  const newVideo = { title, description, url };

  try {
    const oldVideo = await Video.findById(req.params.id);
    if (!oldVideo) {
      return res.redirect(`/videos/${newVideo._id}/edit`, { video: newVideo });
    }
    Object.assign(oldVideo, newVideo);
    oldVideo.validateSync();
    if (oldVideo.errors) {
      const errorString = Object.keys(oldVideo.errors).map(error => oldVideo.errors[error].message);
      return res.status(400).render('videos/create', {
        error: errorString.join('/n'),
        video: oldVideo,
      });
    }
    await oldVideo.save();
    return res.redirect(`/videos/${oldVideo._id}`);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/delete', async (req, res, next) => {
  try {
    const result = await Video.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).redirect('/videos');
    }
    res.redirect('/videos');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
