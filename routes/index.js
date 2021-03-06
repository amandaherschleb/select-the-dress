const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary')
const cloudinaryStorage = require('multer-storage-cloudinary')
const multer = require('multer')

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'dresses',
  allowedFormats: ['jpg', 'png', 'jpeg'],
  transformation: [{height: 1500, width: 1000}]
})

const upload = multer({storage})

const sessions = require('./sessions')
const accounts = require('./accounts')
const dresses = require('./dresses')
const share = require('./share')

module.exports = function (passport) {
  // home route
  router.get('/', function (req, res) {
    res.render('home', res.locals)
  })

  // how it works route
  router.get('/how-it-works', function (req, res) {
    res.render('how-it-works', res.locals)
  })

  // middleware to check if user is logged in
  function isLoggedIn (req, res, next) {
    // if user is authenticated in the session then req.user exists
    if (req.user) {
      return next()
    }
    // if user is not authenticated then redirect to login and send error message
    req.flash('error', 'You need to be logged in to access this page.')
    res.redirect('/log-in')
  }

  // session related routes
  router.get('/sign-up', sessions.signUpPage)
  router.post('/sign-up', sessions.signUpSubmit)
  router.get('/log-in', sessions.logInPage)
  router.post('/log-in', passport.authenticate('local', {
    successRedirect: '/dresses',
    failureRedirect: '/log-in',
    failureFlash: true
  }))
  router.get('/log-out', sessions.logOut)

  // account related routes
  router.get('/account', isLoggedIn, accounts.loadUser, accounts.readPage)
  router.post('/account', isLoggedIn, accounts.loadUser, accounts.update)

  // dress related routes
  router.get('/dresses', isLoggedIn, dresses.listPage)
  router.get('/dresses/add', isLoggedIn, dresses.addPage)
  // image uploader middleware
  const uploader = upload.fields([{ name: 'imgFront', maxCount: 1 }, { name: 'imgBack', maxCount: 1 }, { name: 'imgSide', maxCount: 1 }])
  router.post('/dresses/add', isLoggedIn, uploader, dresses.create)
  router.get('/dresses/compare', isLoggedIn, dresses.comparePage)
  router.get('/dresses/:dress', isLoggedIn, dresses.loadDress, dresses.readPage)
  router.get('/dresses/:dress/edit', isLoggedIn, dresses.loadDress, dresses.editPage)
  // form submit can only handle get and post so setup update and delete like this:
  router.post('/dresses/:dress/edit', isLoggedIn, dresses.loadDress, dresses.update)
  router.post('/dresses/:dress/update-rating', isLoggedIn, dresses.loadDress, dresses.updateRating)
  router.post('/dresses/:dress/delete', isLoggedIn, dresses.loadDress, dresses.delete)

  // share link routes, no login required but user's id needs to be known so it will be in the url
  router.get('/:userID/dresses', share.listPage)
  router.get('/:userID/dresses/compare', share.comparePage)
  router.get('/:userID/dresses/:dress', share.readPage)

  // not using these, alternate way to request update and delete requests, would require AJAX requests
  // router.put('/dresses/:dress', dresses.update)
  // router.delete('/dresses/:dress', dresses.delete)

  return router
}
