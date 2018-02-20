<template>
    <div class="row">
        <div class="col-md-5">
            <form>
                <h2>Εξάμηνο {{ semester }}</h2>
                <div class="card lesson-list border-secondary">
                    <div class="list-group list-group-flush" :id="'lessonOptions-' + semester">
                        <lesson-options v-for="(lesson, key) in lessons" :lesson="lesson" :semester="semester" :key="key"></lesson-options>
                    </div>
                </div>
            </form>
        </div>
        <div class="col-md-7">
            <h3>Αποτελέσματα</h3>
            <div class="card-deck">
                <!--<div class="col-md">-->
                <sector-results v-for="(sector, key, idx) in $sectors"
                                :lessons="lessons"
                                :sector="sector"
                                :alias="key"
                                :key="idx"
                                :results.sync="results[key]"
                ></sector-results>
                <!--</div>-->
            </div>

            <p class="text-primary" v-if="maxSector !== null">Best Sector: <b><big>{{ $sectors[maxSector].short_name }}</big></b></p>
        </div>
    </div>
</template>

<script>
    import LessonOptions from '../components/LessonOptions.vue'
    import SectorResults from '../components/Results/SectorResults.vue'

    export default {
        name: "Semester",
        data: function () { return {
            results: []
        }},
        props: {
            lessons: {
                type: Array,
                required: true
            },
            semester: {
                // Todo: This should be a Number
                type: String,
                required: true
            },
            resultout: {
                type: Object,
                required: true
            }
        },
        components: {
            LessonOptions,
            SectorResults
        },
        computed: {
            maxSector: function () {
                let max = null;

                // Todo: What if there are multiple max values?
                for (let sec in this.$sectors) {
                    if (this.results[sec] !== undefined) {
                        if (max === null || this.results[sec].satisfaction > this.results[max].satisfaction) {
                            max = sec;
                        }
                    }
                }

                this.$emit('update:resultout', {
                    maxSector: max,
                    satisfaction: _.mapValues(this.results, x => x.satisfaction)
                });

                return max;
            }
        }
    }
</script>

