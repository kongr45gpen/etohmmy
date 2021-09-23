<template>
    <div class="card result-sector">
        <h5 class="card-header" v-bind:class="[ 'bg-' + alias ]">Τομέας <b>{{ sector.subtitle_name }}</b></h5>
        <ul class="list-group list-group-flush result-sector-list">
            <lesson-results v-for="(lesson, lkey) in results.chosen" :lesson="lesson" :sector="alias" :key="lkey"></lesson-results>
        </ul>
        <div class="card-body">
        <h6 class="card-title">Άλλα Μαθήματα</h6>
        <p class="card-text text-muted result-other-lessons">
            <span v-for="lesson in results.impossible" v-if="lesson.satisfaction > 0.001">
                {{ lesson.name }} <span class="badge badge-light float-right">{{ lesson.satisfaction.toFixed(1) }}</span><br>
            </span>
        </p>
        </div>
        <div class="card-body">

        </div>
        <div class="card-footer">
            <small class="text-muted">Βαθμολογία Τομέα:</small>
            {{ results.satisfaction.toFixed(1) }}
            <br>
            <small class="text-muted">ECTS (τομέα/σύνολο):</small>
            {{ results.ects_sector }} / {{ results.ects_total }}
        </div>
    </div>
</template>

<script>
    import LessonResults from './LessonResults.vue'
    import _ from 'lodash'

    const Max_Lessons = 7;
    const Free_Lessons = 1;
    const Odd_Lessons = 2;

    export default {
        name: "SectorResults",
        data: function() { return { key: "" }},
        props: {
            lessons: {
                type: Array,
                required: true
            },
            sector: {
                type: Object,
                required: true
            },
            alias: {
                type: String
            },
            oddSemesterResults: {
                type: Object
            }
        },
        components: {LessonResults},
        computed: {
            results: function () {
                let lesson;
                let result = [];
                let thisIsOdd = false;
                /**
                 * Lessons that are not chosen due to constraints
                 * @type {Array}
                 */
                let impossibleLessons = [];
                let output = {};

                // Step 0: Clone the list of lessons
                let lessons = _.clone(this.lessons);

                // If we have lessons from an odd semester, add them!
                if (false && this.oddSemesterResults !== undefined && this.alias === "el") {
                    // TODO: Too many hardcoded values
                    _.each(this.oddSemesterResults.impossible["el"], function (l) {
                        lessons.push(l);
                    });
                    thisIsOdd = true;
                }

                // Sort from best to worst
                lessons = _.sortBy(lessons, function (l) {
                    return -l["satisfaction"];
                });

                // Step 1: Get the necessary lessons
                let i = lessons.length;
                while (i-- > 0) {
                    lesson = lessons[i];

                    if (lesson.status[this.alias] === "Y") {
                        // Add the lesson to the list
                        lesson.reason = "Y";
                        result.push(lesson);

                        // Remove the lesson
                        lessons.splice(i, 1);
                    }
                }

                // Necessary lessons should be sorted alphabetically
                result.sort(function (a, b) {
                    return a.name > b.name;
                });

                if (this.sector.ects_per_semester !== undefined) {
                    // Step 1.1.1: Filter ET lessons only
                    const allSectorLessons = _.filter(lessons, l => l.status[this.alias] === "ET");

                    // Step 1.1.2: Add a score to each lesson
                    for (const lessonId in allSectorLessons) {
                        allSectorLessons[lessonId]["score"] = allSectorLessons[lessonId]["satisfaction"] / allSectorLessons[lessonId]["ects"];
                    }

                    // Step 1.1.3: Optimize
                    const sectorLessons = this._optimiseLessons(allSectorLessons, this.sector.ects_per_semester, 3, 5, function(lessons) {
                        return _.sumBy(l => l["score"]) / _.sumBy(l => l["ects"]);
                    });

                    // Step 1.1.4: Push added lessons to the results
                    for (lesson of sectorLessons) {
                        lesson.reason = "ET";
                        result.push(lesson);
                    }

                    // Step 1.1.4: Remove lessons from further selection
                    const bannedCodes = _.map(sectorLessons, l => l.code)
                    lessons = lessons.filter(l => !_.includes(bannedCodes, l.code));
                }

                // Step 2: Iterate from best to worst lesson
                let lessonsLeft = Max_Lessons - result.length;
                let freeLeft = Free_Lessons;
                let oddLeft = Odd_Lessons;
                // Lessons are sorted from awesome to terrible
                for (let les in lessons) {
                    // Stop if we have no lessons left
                    lesson = lessons[les];

                    if (lesson.status[this.alias] === undefined) {
                        // Oops! Can't pick that lesson!
                        continue;
                    }

                    if (lessonsLeft <= 0) {
                        // TODO: Check for satisfaction removed to allow for odd semesters
                        // if (lesson.satisfaction > 0.01) {
                        impossibleLessons.push(lesson);
                        // } else {
                        //     break;
                        // }

                        continue;
                    }

                    // TODO: Remove hardcoded value
                    // Keeping the soft comparison, since semesters are strings for the time being
                    if (lesson.semester == 7 && thisIsOdd) {
                        if (oddLeft <= 0) continue;

                        oddLeft--;
                    } else if (lesson.status[this.alias] === "EE") {
                        // No more free lessons left
                        if (freeLeft <= 0) {
                            // if (lesson.satisfaction > 0.0) {
                            impossibleLessons.push(lesson);
                            // }
                            continue;
                        }

                        freeLeft--;
                    }

                    lesson.reason = "E";
                    result.push(lesson);
                    lessonsLeft--;
                }

                output["chosen"] = result;
                output["impossible"] = impossibleLessons;

                // Step 3: Calculate statistics
                output["satisfaction"] = _.reduce(result, function (value, lesson) {
                    return value + lesson["satisfaction"]
                }, 0);

                output["ects_sector"] = _.reduce(result, (value, lesson) => {
                    const sector = lesson.status[this.alias];
                    // Differentiate between lessons of this sector
                    if (sector == "Y" || sector == "ET") {
                        return value + lesson["ects"];
                    } else {
                        return value;
                    }
                }, 0);

                output["ects_total"] = _.reduce(result, function (value, lesson) {
                    return value + lesson["ects"]
                }, 0);

                // Emit the update event for the parent Vue component
                this.$emit('update:results', output);

                return output;
            }
        },
        methods: {
            /**
             * Given a list of lessons, selects the ones that are optimal based on their score,
             * so that at least minEcts are attained. Note: This supposes that a `score` attribute
             * exists for each lesson.
             */
            _optimiseLessons(lessons, minEcts, minLessonCount, maxLessonCount, globalScoreCallback) {
                let selectedLessonIds = {}

                if (lessons.length <= 0) return [];

                // Append original ID to lessons since it might get lost after sorting
                for (const lessonId in lessons) {
                    lessons[lessonId]["originalId"] = lessonId;
                }

                // Sort all lessons based on their score, maybe this will improve complexity
                lessons = _.sortBy(lessons, function (l) {
                    return -l["score"];
                });

                for (let n = minLessonCount; n <= maxLessonCount; n++) {
                    selectedLessonIds[n] = new Array(n);

                    // Step 1: Add the lessons with maximum score
                    let i = 0;
                    for (const lessonId in lessons) {
                        if (i >= n) {
                            break;
                        }

                        // First lesson is always the one with highest score
                        selectedLessonIds[n][i] = lessonId;
                        lessons[lessonId]["used"] = true;

                        i++;
                    }

                    // Step 2: Change worst lesson until we have minEcts achievement
                    let loops = 0;
                    while (true) {
                        // Step 2.1: Find if ECTS condition is OK
                        let ectsSum = _.reduce(selectedLessonIds[n], (ects, lesson) => ects + parseFloat(lessons[lesson]["ects"]), 0)

                        if (ectsSum >= minEcts) {
                            break;
                        }

                        if (loops > 100) {
                            console.error("Could not optimise lessons for N = " + n);
                            selectedLessonIds[n] = undefined;
                            break;
                        }

                        // Step 2.2: Find the worst lesson with the lowest ECTS
                        let worstLesson = null;
                        for (const [lessonIndex, lessonId] of Object.entries(_.reverse(selectedLessonIds[n]))) {
                            if (worstLesson === null) {
                                worstLesson = lessonIndex;
                            } else if (lessons[lessonId].ects < lessons[selectedLessonIds[n][worstLesson]]) {
                                worstLesson = lessonIndex;
                            }
                        }

                        // Step 2.3: Replace the worst lesson with another lesson, not chosen
                        // Start measuring from top (best) to bottom

                        let replacementLesson = null;
                        for (const lessonId of selectedLessonIds[n]) {
                            if (lessons[lessonId]["used"] !== undefined) {
                                // Lesson has been tested/added/removed before, skip
                                continue;
                            } else if (lessons[lessonId].ects <= lessons[selectedLessonIds[n][worstLesson]]) {
                                // This lesson does not increase ECTS, don't use it
                                continue;
                            } else {
                                // Found a suitable replacement (even if worse opinion)
                                replacementLesson = lessonId;
                                break;
                            }
                        }

                        if (replacementLesson === null) {
                            // No lessons could be found to satisfy N
                            selectedLessonIds[n] = undefined;
                            break;
                        }

                        // Step 2.4: Replacement lesson has been found, make the switch
                        selectedLessonIds[n][worstLesson] = replacementLesson;

                        // Sort the array so that any next iterations know what to do
                        selectedLessonIds[n] = _.sortBy(selectedLessonIds[n], function (l) {
                            return -lessons[l]["score"];
                        });
                    }
                }

                // Find the best n
                let bestN = null;
                let bestNscore = null;
                for (let n = minLessonCount; n <= maxLessonCount; n++) {
                    if (selectedLessonIds[n] === undefined) {
                        continue;
                    }

                    let globalScore = globalScoreCallback(_.map(selectedLessonIds, (id) => lessons[id]))

                    if (bestNscore === null || bestNscore < globalScore) {
                        bestN = n;
                        bestNscore = globalScore;
                    }
                }

                return _.map(selectedLessonIds[bestN], (id) => lessons[id])
            }
        }
    }
</script>
