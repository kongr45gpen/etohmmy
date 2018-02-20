<template>
    <div class="card result-sector">
        <h5 class="card-header" v-bind:class="[ 'bg-' + alias ]">Τομέας <b>{{ sector.subtitle_name }}</b></h5>
        <ul class="list-group list-group-flush result-sector-list">
            <lesson-results v-for="(lesson, lkey) in results.chosen" :lesson="lesson" :sector="alias" :key="lkey"></lesson-results>
        </ul>
        <div class="card-body">
        <h6 class="card-title">Άλλα Μαθήματα</h6>
        <p class="card-text text-muted">
            <span v-for="lesson in results.impossible">
                {{ lesson.name }} <span class="badge badge-light float-right">{{ lesson.satisfaction.toFixed(1) }}</span><br>
            </span>
        </p>
        </div>
        <div class="card-body">

        </div>
        <div class="card-footer">
            <small class="text-muted">Βαθμολογία Τομέα:</small>
            {{ results.satisfaction.toFixed(1) }}
        </div>
    </div>
</template>

<script>
    import LessonResults from './LessonResults.vue'
    import _ from 'lodash'

    const Max_Lessons = 7;
    const Free_Lessons = 1;

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
            }
        },
        components: {LessonResults},
        computed: {
            results: function () {
                let lesson;
                let result = [];
                /**
                 * Number of lessons that have a positive satisfaction, but are not chosen due
                 * to constraints.
                 * @type {Array}
                 */
                let impossibleLessons = [];
                let output = {};

                // Clone the list of lessons
                let lessons = _.sortBy(this.lessons, function (l) {
                    return -l["satisfaction"];
                });

                // Step 1: Get the necessary lessons
                let i = lessons.length;
                while (i-- > 0) {
                    lesson = lessons[i];

                    if (lesson.status[this.alias] === "Y") {
                        // Add the lesson to the list
                        result.push(lesson);

                        // Remove the lesson
                        lessons.splice(i, 1);
                    }
                }

                // Necessary lessons should be sorted alphabetically
                result.sort(function (a, b) {
                    return a.name < b.name;
                });

                // Step 2: Iterate from best to worst lesson
                let lessonsLeft = Max_Lessons - result.length;
                let freeLeft = Free_Lessons;
                // Lessons are sorted from awesome to terrible
                for (let les in lessons) {
                    // Stop if we have no lessons left
                    lesson = lessons[les];

                    if (lesson.status[this.alias] === undefined) {
                        // Oops! Can't pick that lesson!
                        continue;
                    }

                    if (lessonsLeft <= 0) {
                        if (lesson.satisfaction > 0.01) {
                            impossibleLessons.push(lesson);
                        } else {
                            break;
                        }

                        continue;
                    }

                    if (lesson.status[this.alias] === "EE") {
                        // No more free lessons left
                        if (freeLeft <= 0) {
                            if (lesson.satisfaction > 0.0) {
                                impossibleLessons.push(lesson);
                            }
                            continue;
                        }

                        freeLeft--;
                    }

                    result.push(lesson);
                    lessonsLeft--;
                }

                output["chosen"] = result;
                output["impossible"] = impossibleLessons;

                // Step 3: Calculate statistics
                output["satisfaction"] = _.reduce(result, function (value, lesson) {
                    return value + lesson["satisfaction"]
                }, 0);

                // Emit the update event for the parent Vue component
                this.$emit('update:results', output);

                return output;
            }
        }
    }
</script>
