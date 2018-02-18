#!/usr/bin/env node

console.info = require('console-info');
console.warn = require('console-warn');
console.error = require('console-error');
const fs = require('fs');
const commander = require('commander');
const request = require('request');
const _ = require('lodash');
const cheerio = require('cheerio');
require('pretty-error').start();

commander
    .arguments('<file>').action(file => commander.file = file)
    .parse(process.argv);

if (commander.file === undefined) throw new Error("Invalid arguments. Use the --help option to see usage information for this script.");

const contents = fs.readFileSync(commander.file, 'utf8');
// console.log(contents);

let count = 0;

let onCourseLink = _.before(2,_.throttle(function(path) {
    console.log("Visiting page " + path);

    request(path, function (error, response, body) {
        if (error) {
            console.error(error);
            return;
        }

        fs.writeFileSync("file.html", body);
        // console.log(response);
        onCourseVisited(cheerio.load(body), path);
    });
}, 2000));

let onCourseVisited = function($, path) {
    let rawAttribs = {};
    let sectorAttribs = [];
    let attribs = {};
    let semesterSet = new Set();

    // has(td) to make sure we don't catch the header row
    $("table.qa_general_data tr:has(td)").each(function (i, elem) {
        rawAttribs[$(this).children("td:first-child").text()] = $(this).children("td:last-child").text().trim();
    });

    $("table.qa_course-orientation-info tr:has(td)").each(function (i, elem) {
        sectorAttribs[i] = {
            name: $(this).children("td:first-child").text(),
            status: $(this).children("td:nth-child(2)").text(),
            semester: $(this).children("td:nth-child(3)").text(),
            year: $(this).children("td:nth-child(4)").text(),
            ects: $(this).children("td:nth-child(5)").text(),
        };
    });

    // Validation
    if (_.isEmpty(sectorAttribs)) return;
    let ects = sectorAttribs[0].ects;
    for (let i in sectorAttribs) {
        if (sectorAttribs[i].ects !== ects) {
            console.error("Found non-equal ECTS values! " + sectorAttribs[i].ects + " " + ects);
        }
    }

    console.log(rawAttribs, sectorAttribs);

    const description = {
        syllabus: $("#course-elem-course-content-syllabus .value").text(),
        outcomes: $("#course-elem-learning-outcomes .value").text(),
        skills:   $("#course-elem-general-competences .value, #course-elem-general-competences ul").text(),
    };

    attribs = {
        code: rawAttribs["Class ID"],
        humanCode: rawAttribs["Κωδικός"],
        title: rawAttribs["Τίτλος"],
        ects: parseInt(ects),
        status: {},
        qa: path,
        professors: new Set(),
        description: description,
    };

    // Calculate some cool attributes
    for (let i in sectorAttribs) {
        let sector = sectorAttribs[i];
        let sc, status;
        switch (sector.name) {
            case 'Ηλεκτρικής Ενέργειας':
                sc = 'en';
                break;
            case 'Ηλεκτρονικής και Υπολογιστών':
                sc = 'el';
                break;
            case 'Τηλεπικοινωνιών':
                sc = 'tel';
                break;
            default:
                sc = 'wat';
                console.error("Unknown sector " + sector.name + "!");
        }
        switch (sector.status) {
            case 'Υποχρεωτικό':
                status = 'Y';
                break;
            case 'Επιλογής':
                status = 'E';
                break;
            case 'Ελεύθερης Επιλογής':
                status = 'EE';
                break;
            default:
                status = '??';
                console.error("Unknown status " + sector.status + "!");
        }
        attribs.status[sc] = status;
        semesterSet.add(parseInt(sector.semester));
    }

    for (let what in rawAttribs) {
        if (_.startsWith(what, 'Υπεύθυν') || _.startsWith(what, 'Διδάσκ')) {
            rawAttribs[what].split(',').forEach(function (professor) {
                attribs.professors.add(professor.trim());
            });
        }
    }

    for (let semester of semesterSet) {
        console.info("Adding lesson " + attribs.title + " to semester " + semester);
    }

    // attribs.professors = _.uniqu

    console.log(attribs);
};

let $ = cheerio.load(contents);
$("a").each(function(i, elem) {
    if ($(this).attr('href') !== undefined) {
        onCourseLink('https://qa.auth.gr' + $(this).attr('href'));
    }
});
