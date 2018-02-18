<template>
    <div class="card result-sector">
        <h5 class="card-header" v-bind:class="[ 'bg-' + alias ]">Τομέας <b>{{ sector.subtitle_name }}</b></h5>
        <ul class="list-group list-group-flush result-sector-list">
            <lesson-results v-for="(lesson, lkey) in results" :lesson="lesson" :sector="alias" :key="lkey"></lesson-results>
        </ul>
        <!--<div class="card-body">-->
        <!--<h5 class="card-title">Special title treatment</h5>-->
        <!--<p class="card-text">With supporting text below as a natural lead-in to additional content.</p>-->
        <!--<a href="#" class="btn btn-primary">Go somewhere</a>-->
        <!--</div>-->
        <div class="card-body">

        </div>
        <div class="card-footer">
            <small class="text-muted">Ευχαρίστηση Τομέα:</small>
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
                    if (lessonsLeft <= 0) break;

                    lesson = lessons[les];

                    if (lesson.status[this.alias] === "EE") {
                        // No more free lessons left
                        if (freeLeft <= 0) continue;

                        freeLeft--;
                    }

                    result.push(lesson);
                    lessonsLeft--;
                }

                // Step 3: Calculate statistics
                result["satisfaction"] = _.reduce(result, function (value, lesson) {
                    return value + lesson["satisfaction"]
                }, 0);

                // // Calculate statistics
                // var maxSector = null;
                // for (var sec in result[sem]) {
                //     if (maxSector === null || result[sem][sec]["satisfaction"] > result[sem][maxSector]["satisfaction"]) {
                //         maxSector = sec;
                //     }
                // }
                // result[sem]["maxSector"] = maxSector;

                // Emit the update event for the parent Vue component
                this.$emit('update:results', result);

                return result;
            }
        }
    }
</script>
