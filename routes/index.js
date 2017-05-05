var express = require('express'),
uwapi   = require('uwaterloo-api');

var router  = express.Router();

var uwclient = new uwapi({
    API_KEY : 'f33cbfeda01c94b4f95a7eb48cd209b6'
});

router.get('/', function(req, res, next) {
    res.render('index');
});

router.post('/', function(req, res, next) {
    var b = req.body.building,
        r = req.body.room;

    uwclient.get('/buildings/{building}/{room}/courses', {
            building: b, room: r
        }, function(err, response) {
            var courses = response.data;
            var building = b.toUpperCase();
            res.render('index', {
                building: building,
                room: r,
                courses: courses
            });
        });
});

module.exports = router;
