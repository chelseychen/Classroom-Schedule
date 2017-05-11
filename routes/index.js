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
            var courses_raw = response.data;
            var courses = processData(courses_raw);
            var building = b.toUpperCase();
            var today = new Date();
            var date = today.toDateString();
            res.render('index', {
                date: date,
                building: building,
                room: r,
                courses: courses
            });
        });
});

// Process all the courses and make them use the format of event_source
processData = function(courses_raw) {
    var courses = [];
    courses_raw.forEach(function(course_raw) {
        if (checkWeekday(course_raw.weekdays)) {

            var title = course_raw.subject.concat(" ", course_raw.catalog_number,
                " - ", course_raw.title, ": ", course_raw.section);
            var url = getUrl(course_raw.term, course_raw.subject, course_raw.catalog_number);
            var start = processTime(course_raw.start_time);
            var end = processTime(course_raw.end_time);
            var course = {
                "title": title,
                "url": url,
                "start": start, // Milliseconds
                "end": end // Milliseconds;
            };
            courses.push(course);
        }
    });

    return courses;
};

// Check if we have this class today
checkWeekday = function(weekdays) {
    var tmp = ["S", "M", "T", "W", "Th", "F", "Sa"];
    var today = new Date();
    var day = tmp[today.getDay()];
    if (weekdays.includes(day)) {
        if (day == "T") {
            if (weekdays.indexOf("T")+1 == weekdays.length) return true;
            if (weekdays[weekdays.indexOf("T")+1] != "h") return true;
            return false;
        } else {
            return true;
        }
    }
    return false;
}

// Produce the link to class info
getUrl = function(term, subject, catalog_number) {
    if (catalog_number <= 499) var level = "&level=under";
    else var level = "&level=grad";
    var sess = "?sess=".concat(term.toString());
    var sub = "&subject=".concat(subject);
    var numder = "&cournum=".concat(catalog_number.toString());
    var url = "https://info.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl".concat(sess, level, sub, numder);
    return url;
}

// Given time as xx:xx, return the milliseconds of today at xx:xx
processTime = function(time) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var today = new Date();
    var year = today.getFullYear().toString();
    var month = months[today.getMonth()];
    var date = today.getDate().toString(); // 1, ..., 31
    var time_string = date.concat(" ", month, " ", year, " ", time, ":00 UTC-0400");
    var result = Date.parse(time_string);
    return result;
}

module.exports = router;
