#!/usr/bin/env node

console.info = require('console-info');
console.warn = require('console-warn');
console.error = require('console-error');
const fs = require('fs');
const commander = require('commander');
const request = require('request');
const _ = require('lodash');
const cheerio = require('cheerio');
const yaml = require('js-yaml');
require('pretty-error').start();

commander
    .arguments('<file>').action(file => commander.file = file)
    .parse(process.argv);

if (commander.file === undefined) throw new Error("Invalid arguments. Use the --help option to see usage information for this script.");

const existingConfig = yaml.safeLoad(fs.readFileSync(require('path').resolve(__dirname, '../data/lessons.yml'), 'utf8'));
const contents = fs.readFileSync(commander.file, 'utf8');

// Javascript asynchronous promises
let promises = [];

let onCourseLink = function(path, resolve, reject) {
    console.log("Performing request to " + path);
    request(path, function (error, response, body) {
        if (error) {
            console.error(error);
            reject();
            return;
        }

        fs.writeFileSync("file.html", body);
        // console.log(response);
        onCourseVisited(cheerio.load(body), path);
        resolve();
    });
};

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

    const description = {
        syllabus: $("#course-elem-course-content-syllabus .value").text(),
        outcomes: $("#course-elem-learning-outcomes .value").text()
    };

    attribs = {
        code: rawAttribs["Class ID"],
        humanCode: rawAttribs["Κωδικός"],
        originalTitle: rawAttribs["Τίτλος"],
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
            case 'Ελεύθερη Επιλογή':
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
        // Get the possible prefixes of property names that correspond to professors
        if (_.startsWith(what, 'Υπεύθυν') || _.startsWith(what, 'Διδάσκ')) {
            rawAttribs[what].split(/[,\n\t]+/g).forEach(function (professor) {
                attribs.professors.add(professor.trim());
            });
        }
    }

    // Transform/sanitise values
    attribs.professors = [...attribs.professors];

    for (let semester of semesterSet) {
        if (existingConfig.semesters[semester] === undefined) {
            console.warn("Semester " + semester + " not found, creating...");
            existingConfig.semesters[semester] = [];
        }

        const oldData = existingConfig.semesters[semester];

        // Search for an existing entry for this lesson
        let datum = _.find(oldData, function(value) {
            return value.code === attribs.code || value.humanCode === attribs.humanCode || value.qa === attribs.qa;
        });

        if (datum !== undefined) {
            console.info("Adding lesson " + attribs.originalTitle + " to semester " + semester, "(" + datum.name + ")");
            // Update the existing entry, keeping old elements
        } else {
            console.info("Adding lesson " + attribs.originalTitle + " to semester " + semester);
            console.warn("No existing entry found for lesson, creating a new one...");
            datum = {};
            existingConfig.semesters[semester].push(datum);
        }

        Object.assign(datum, attribs);
    }
};

let $ = cheerio.load(contents);
$("a").each(function(i, elem) {
    if ($(this).attr('href') !== undefined) {
        const href = $(this).attr('href');

        // if (i > 4) return;

        // TODO: Throttle
        promises.push(new Promise(function(resolve, reject) {
            onCourseLink('https://qa.auth.gr' + href, resolve, reject);
        }));
    }
});

console.log("Waiting for " + promises.length + " links...");

Promise.all(promises).then(function() {
   console.info("All done.");
   fs.writeFileSync(require('path').resolve(__dirname, '../data/lessons.yml'), yaml.dump(existingConfig, {
       noCompatMode: true,
       noRefs: true
   }));
}, function (err) {
    console.error("Something has gone terribly wrong.");
    console.error(err);
}).catch(function(error) {
    console.error("Exception Error");
    console.error(error);
});

