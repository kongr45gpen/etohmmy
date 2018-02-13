import Vue from 'vue';
import Lessons from '../data/lessons.json'

const Max_Lessons = 7;
const Free_Lessons = 1;

console.log("Welcome to BETHMMY.");

Array.prototype.clone = function(callback, thisArg) {
    return this.slice(0);
}

var app = new Vue({
    el: '#app',
    data: {
        semesters: Lessons["semesters"],
        sectors: Lessons["sectors"]
    },
    computed: {
        results: function () {
            var result = [];

            for (var sem in this.semesters) {
                // Initialise the empty array for the semester
                result[sem] = [];

                // Clone the list of lessons
                var initialLessons = this.semesters[sem].clone();

                // Sort the lessons based on preference
                initialLessons.sort(function (a, b) {
                    return parseFloat(a["satisfaction"]) < parseFloat(b["satisfaction"]);
                })

                for (var sec in Lessons["sectors"]) {
                    result[sem][sec] = [];

                    // Copy the lessons array so we can remove elements at will
                    var lessons = initialLessons.clone();

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
                    var satisfaction = 0;
                    for (var les in result[sem][sec]) {
                        var value = parseFloat(result[sem][sec][les]["satisfaction"]);

                        if (!isNaN(value)) satisfaction += value;
                    }
                    result[sem][sec]["satisfaction"] = satisfaction;
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
