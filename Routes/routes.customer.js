const express = require('express');
const router = express.Router();
const apiAuth = require('../middleware/middleware.apiAuth')
const Customer = require('../Controllers/Controller.Customer');
const Charging = require('../Controllers/Controller.charging');
const { storeCallback } = require('../Controllers/Controller.Callback');
const { upload, uploadXlsxMsisdn } = require('../Controllers/Controller.CustomerCSV');

router.post('/store-customer', apiAuth, Customer);
router.get('/charging' , apiAuth, Charging);
router.post('/hutch/callback' , storeCallback);
router.post(
    '/upload-msisdn-csv',
    upload.single('file'),
    uploadXlsxMsisdn
);

module.exports = router;
