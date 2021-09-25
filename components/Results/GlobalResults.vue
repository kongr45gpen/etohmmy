<template>
</template>

<script>
    // Any calculations that need to be performed on all semesters and/or sectors

    import SectorResults from './SectorResults.vue';

    // In theory, the study guide does not impose a semester-specific limit on the number of selected lessons.
    // However, it may be somewhat impossible for students to observe too many lessons in a single semester, so
    // we add a limit here to make sure that lesson distribution is even.
    const Min_Lessons = 5;
    const Initial_Lessons = 10;
    const Min_ECTS = 90;

    const Min_ET_Semester = 3;
    const Max_ET_Semester = 5;

    export default {
        name: "GlobalResults",
        props: {
            semesters: {
                type: Object,
                required: true,
            },
            results: {
                type: Object
            }
        },
        watch: {
            semesters: {
                deep: true,
                immediate: true,
                handler() {
                    // Throttle the update function so that we don't overwhelm the user's CPU
                    if (this.throttledUpdate === undefined) {
                        this.throttledUpdate = _.throttle(this.update, 200, { trailing: true });
                    }

                    this.throttledUpdate();
                }
            }
        },
        methods: {
            update: function() {
                let results = {}

                const optimiseLessons = SectorResults.methods.optimiseLessons;

                for (const [alias, sector] of Object.entries(this.$sectors)) {
                    // if (sector.ects_total === undefined) {
                        // continue;
                    // }

                    // // Gather all lessons of this sector
                    // let allLessons = Object.values(this.semesters).flat(1);
                    // let allSectorLessons = allLessons.filter(l => l.status[alias] === "ET");

                    // // Add a score to each lesson
                    // for (const lessonId in allSectorLessons) {
                    //     allSectorLessons[lessonId]["score"] = allSectorLessons[lessonId]["satisfaction"] / allSectorLessons[lessonId]["ects"];
                    // }

                    // // Optimize
                    // const forcedLessons = optimiseLessons(allSectorLessons, sector.ects_total, 9, 16, function(lessons) {
                    //     return _.sumBy(l => l["score"]) / _.sumBy(l => l["ects"]);
                    // });

                    // // Group lessons by semester
                    // results[alias] = _.groupBy(forcedLessons, l => parseInt(l.semester));


                    // Gather all lessons of this sector
                    let allLessons = Object.values(this.semesters).flat(1);
                    allLessons = _.sortBy(allLessons, [
                        l => -l["satisfaction"],
                        l => l["name"] // Secondary sort by name so we don't gather all lessons by semester
                    ]);

                    // Sorted IDs of lessons that have not been used
                    let unusedLessons = [...allLessons.keys()];

                    // Lessons with >0 score that were not added but are still likeable
                    let otherLessons = [];

                    // Append original ID for later use
                    for (const lesson in allLessons) {
                        allLessons[lesson]["originalId"] = parseInt(lesson);
                        allLessons[lesson]["semester"] = parseInt(allLessons[lesson]["semester"]);
                        // unusedLessons.push(lesson);
                    }

                    let semesterResults = {};

                    // Group lessons by semester
                    const groupedLessons = _.groupBy(allLessons, l => l.semester);

                    // Add the first Max_Lesson lessons on each semester
                    for (let [semester, semesterLessons] of Object.entries(groupedLessons)) {
                        semesterResults[semester] = [];

                        // Add Y lessons on each semester
                        for (const lesson of _.filter(semesterLessons, l => l.status[alias] === "Y")) {
                            semesterResults[semester].push(lesson);
                            _.pull(unusedLessons, lesson["originalId"]);
                        }

                        // Add ET lessons for each semester, if applicable
                        if (sector.ects_per_semester !== undefined) {
                            let lessonsToOptimise = _.filter(semesterLessons, l => l.status[alias] === "ET");
                            for (const lessonId in lessonsToOptimise) {
                                lessonsToOptimise[lessonId]["score"] = lessonsToOptimise[lessonId]["satisfaction"] / lessonsToOptimise[lessonId]["ects"];
                            }

                            const optimisedLessons = SectorResults.methods.optimiseLessons(
                                lessonsToOptimise,
                                sector.ects_per_semester,
                                Min_ET_Semester,
                                Max_ET_Semester,
                                function(lessons) {
                                    return _.sumBy(lessons, l => l.score) / _.sumBy(lessons, l => l.ects);
                                }
                            )

                            for (const lesson of optimisedLessons) {
                                lesson.reason = "ET";
                                semesterResults[semester].push(lesson);
                                _.pull(unusedLessons, lesson["originalId"]);
                            }
                        }

                        let i = 0;
                        for (const lesson of semesterLessons) {
                            if (lesson.status[alias] === "Y") {
                                // Lesson already added before
                                continue;
                            }

                            if (lesson.used !== undefined) {
                                // Lesson used by optimiser
                                continue;
                            }

                            _.pull(unusedLessons, lesson["originalId"]);
                            semesterResults[semester].push(lesson);

                            if (semesterResults[semester].length >= Initial_Lessons || i >= Initial_Lessons) {
                                break;
                            }

                            i++;
                        }
                    }

                    // Perform adjustments until we have needed ECTS
                    let loops = 0;
                    while (true) {
                        if (loops++ > 100) {
                            console.error("Too many lesson calculation iterations");
                            break;
                        }

                        if (sector.ects_total === undefined) {
                            // No further lesson checks
                            break;
                        }

                        if (sector.ects_total !== undefined) {
                            const sectorLessons = _.filter(Object.values(semesterResults).flat(), l => l.status[alias] === "ET");
                            const sectorECTS =  _.reduce(sectorLessons, (ects, lesson) => ects + parseFloat(lesson.ects), 0)

                            // We are done! All lessons have the required ECTS
                            if (sectorECTS >= sector.ects_total) break;
                        }

                        if (unusedLessons.length <= 0) {
                            console.error("Ran out of lessons to fill");
                            break;
                        }

                        // Append one lesson that increases the sector ECTS
                        const newLessonId = unusedLessons[0];
                        unusedLessons.shift();
                        const newLessonSemester = allLessons[newLessonId].semester;
                        semesterResults[newLessonSemester].push(allLessons[newLessonId]);
                    }

                    // Starting from the end to the beginning, keep removing lessons, making sure we are within limits
                    let worstSemesterLessons = Object.values(semesterResults).flat();
                    worstSemesterLessons = _.sortBy(worstSemesterLessons, l => +l["satisfaction"]);

                    for (const worstLesson of worstSemesterLessons) {
                        if (worstLesson.status[alias] === "Y") {
                            // Never remove Y lessons
                            continue;
                        }

                        // Gather information to perform calculations later
                        // This also refreshes the results in case any values were removed
                        const allLessons = Object.values(semesterResults).flat();
                        const sectorLessons = _.filter(allLessons, l => l.status[alias] === "ET");

                        const totalECTS = _.sumBy(allLessons, l => l.ects)
                        const sectorECTS = _.sumBy(sectorLessons, l => l.ects)

                        // Group even/odd semesters
                        let thisSemesterCount = _.sumBy(allLessons, l => (l.semester) % 2 === (worstLesson.semester) % 2);
                        if (worstLesson.semester % 2 == 0) {
                            // Assume another full semester exists
                            thisSemesterCount += Min_Lessons;
                        }

                        // Simulate this lesson missing
                        const totalECTSchanged = totalECTS - worstLesson.ects;
                        const sectorECTSchanged = (worstLesson.status[alias] === "ET") ? (sectorECTS - worstLesson.ects) : sectorECTS;
                        const thisSemesterCountChanged = thisSemesterCount - 1;

                        // Check if we can remove this lesson
                        if (totalECTSchanged < Min_ECTS) {
                            // console.log("Removing lesson " + worstLesson.name + " would reduce total ECTS from " + totalECTS + " to " + totalECTSchanged);
                            // Total ECTS for all semesters not enough
                            continue;
                        }

                        if (sector.ects_total !== undefined && sectorECTSchanged < sector.ects_total) {
                            // console.log("Removing lesson " + worstLesson.name + " would reduce SECTOR ECTS from " + sectorECTS + " to " + sectorECTSchanged);
                            // Sector ECTS not enough for this sector

                            // Specify lesson reason for clarity
                            let index = _.findIndex(semesterResults[worstLesson.semester], l => l.code === worstLesson.code);
                            // semesterResults[worstLesson.semester][index].reason = "ET";

                            continue;
                        }

                        if (sector.ects_per_semester !== undefined && worstLesson.reason === "ET") {
                            // The optimisation algorithm above chose this lesson, it's probably not OK to remove
                            continue;
                        }

                        if (thisSemesterCountChanged < 2 * Min_Lessons) {
                            // console.log("Removing lesson " + worstLesson.name + " would reduce lesson count from " + thisSemesterCount + " to " + thisSemesterCountChanged);
                            // Too few lessons in this semester
                            continue;
                        }

                        // All checks complete, we can now remove this lesson from the array
                        _.remove(semesterResults[worstLesson.semester], l => l.code === worstLesson.code);

                        if (worstLesson.satisfaction > 0) {
                            otherLessons.push(worstLesson);
                        }
                    }

                    results[alias] = {
                        "chosen": semesterResults,
                        "impossible": _.groupBy(_.reverse(otherLessons), l => (l.semester))
                    };
                }

                this.$emit('update:results', results);

                // return _.map(results, s => _.map(s, s => _.map(s, l => l.name)));
            }
        }
    }
</script>
