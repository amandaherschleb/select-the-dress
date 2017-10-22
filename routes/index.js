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

router.get('/', function (req, res) {
  res.render('home', res.locals)
})

// session related routes
router.get('/sign-up', sessions.signUpPage)
router.post('/sign-up', sessions.signUpSubmit)
router.get('/log-in', sessions.logInPage)
router.post('/log-in', sessions.logInSubmit)
router.get('/log-out', sessions.logOut)

// account related routes
router.get('/account', accounts.loadUser, accounts.readPage)
router.get('/account/edit', accounts.loadUser, accounts.editPage)
router.post('/account/edit', accounts.loadUser, accounts.update)

// dress related routes
const uploader = upload.fields([{ name: 'imgFront', maxCount: 1 }, { name: 'imgBack', maxCount: 1 }, { name: 'imgSide', maxCount: 1 }])
router.get('/dresses', dresses.listPage)
router.get('/dresses/add', dresses.addPage)
router.post('/dresses/add', uploader, dresses.create)
router.get('/dresses/compare', dresses.comparePage)
router.get('/dresses/:dress', dresses.loadDress, dresses.readPage)
router.get('/dresses/:dress/edit', dresses.loadDress, dresses.editPage)
// form submit can only handle get and post so setup update and delete like this:
router.post('/dresses/:dress/edit', dresses.loadDress, dresses.update)
router.post('/dresses/:dress/delete', dresses.loadDress, dresses.delete)

// not using these, alternate way to request update and delete requests, would require AJAX requests
// router.put('/dresses/:dress', dresses.update)
// router.delete('/dresses/:dress', dresses.delete)

module.exports = router
