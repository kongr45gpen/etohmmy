import Vue from 'vue';
import _ from '../node_modules/underscore/underscore.js';
import Lessons from '../data/lessons.json'

// CSS & HTML updating
import '../css/main.css'
import '../index.html'

const Max_Lessons = 7;
const Free_Lessons = 1;
const Max_Satisfaction = 10;

console.log("Welcome to BETHMMY.");

// Initialise vue variables
_.each(Lessons["semesters"], function(s) {
    _.each(s, function(l) {
        l["satisfaction"] = 0.0;
    })
});

function colourise(satisfaction) {
    var colour = [ 255, 255, 255 ];

    if (satisfaction > 0) {
        // Linear interpolation
        colour[0] = 255 * (1.0 - 0.8 * satisfaction / Max_Satisfaction);
        colour[2] = 255 * (1.0 - 0.5 * satisfaction / Max_Satisfaction);
    } else {
        colour[1] = 255 * (1.0 + 0.7 * satisfaction / Max_Satisfaction);
        colour[2] = 255 * (1.0 + 0.8 * satisfaction / Max_Satisfaction);
    }

    var opacity = 0.7;

    return "rgba(" + Math.round(colour[0]) + "," + Math.round(colour[1]) + "," + Math.round(colour[2]) + "," + opacity + ")";
}

var nav = new Vue({
    el: '#nav',
    data: {
        webpack_reload_count: 0
    }
});

var app = new Vue({
    el: '#app',
    data: {
        semesters: Lessons["semesters"],
        sectors: Lessons["sectors"],
        sample: "teste text",
    },
    computed: {
        colouredSatisfactions: function() {
            var output = [];
            for (var s in this.semesters) {
                output[s] = [];
                for (var l in this.semesters[s]) {
                    output[s][l] = colourise(this.semesters[s][l].satisfaction);
                }
            }
            return output;
        },
        results: function () {
            var result = [];

            for (var sem in this.semesters) {
                // Initialise the empty array for the semester
                result[sem] = [];

                // Clone the list of lessons
                var initialLessons = _.sortBy(this.semesters[sem], function(l) {
                    return -l["satisfaction"];
                });

                for (var sec in Lessons["sectors"]) {
                    result[sem][sec] = [];

                    // Copy the lessons array so we can remove elements at will
                    var lessons = _.clone(initialLessons);

                    // Step 1: Get the necessary lessons
                    var i = lessons.length;
                    while (i-- > 0) {
                        var lesson = lessons[i];

                        if (lesson.status[sec] == "Y") {
                            // Add the lesson to the list
                            result[sem][sec].push(lesson);

                            // Remove the lesson
                            lessons.splice(i, 1);
                        }
                    }

                    // Necessary lessons should be sorted alphabetically
                    result[sem][sec].sort(function(a, b) {
                        return a.name < b.name;
                    });

                    // Step 2: Iterate from best to worst lesson
                    var lessonsLeft = Max_Lessons - result[sem][sec].length;
                    var freeLeft = Free_Lessons;
                    // Lessons are sorted from awesome to terrible
                    for (var les in lessons) {
                        // Stop if we have no lessons left
                        if (lessonsLeft <= 0) break;

                        var lesson = lessons[les];

                        if (lesson.status[sec] == "EE") {
                            // No more free lessons left
                            if(freeLeft <= 0) continue;

                            freeLeft--;
                        }

                        result[sem][sec].push(lesson);
                        lessonsLeft--;
                    }

                    // Step 3: Calculate statistics
                    result[sem][sec]["satisfaction"] = _.reduce(result[sem][sec], function (value, lesson) {
                        return value + lesson["satisfaction"]
                    }, 0);
                }

                // Calculate statistics
                var maxSector = null;
                for (var sec in result[sem]) {
                    if (maxSector === null || result[sem][sec]["satisfaction"] > result[sem][maxSector]["satisfaction"]) {
                        maxSector = sec;
                    }
                }
                result[sem]["maxSector"] = maxSector;
            }

            return result;
        }
    }
})

// Export values so they can be accessed in the developer console
window.lessons = Lessons
window.app = app

if (module.hot) {
    module.hot.addStatusHandler(function(status) {
        if (status === "apply") {
            nav.webpack_reload_count++;
        }
    })
}

// if (module.hot) {
//    module.hot.accept(function() {
//          console.log('Accepting the updated printMe module!');
//          printMe();
//        })
//  }
