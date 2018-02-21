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
                                :odd-semester-results="oddSemesterResults"
                                :results.sync="results[key]"
                ></sector-results>
                <!--</div>-->
            </div>

            <p class="text-primary m-2" v-if="maxSectors !== null">
                {{ (maxSectors.length === 1) ? 'Καλύτερος Τομέας' : 'Καλύτεροι Τομείς' }}:
                <!--<b><big>{{ $sectors[maxSector].short_name }}</big></b>-->
                <b><big>{{ maxSectors.map(s => $sectors[s].short_name).join(', ') }}</big></b>
            </p>

            <p class="text-muted m-2" v-if="oddSemesterResults !== undefined">
                <b>Σημείωση:</b> Λόγω έλλειψης καθηγητών, <em>συνήθως</em> οι φοιτητές του τομέα
                Ηλεκτρονικής του 9<sup>ου</sup> εξαμήνου μπορούν να επιλέξουν 2 μαθήματα του
                7<sup>ου</sup> εξαμήνου. <a href="http://ee.auth.gr/announcements/2017/10/12/8506/">Περισσότερες πληροφορίες&hellip;</a>
            </p>
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
                required: true
            },
            oddSemesterResults: {
                type: Object
            }
        },
        components: {
            LessonOptions,
            SectorResults
        },
        computed: {
            maxSectors: function () {
                const results = this.results;
                let max = this.maxElements(this.$sectors, function(item, key) {
                    if (results[key] !== undefined)
                        return results[key].satisfaction;
                });

                this.$emit('update:resultout', {
                    maxSectors: max,
                    satisfaction: _.mapValues(this.results, x => x.satisfaction),
                    impossible: _.mapValues(this.results, x => x.impossible)
                });

                return max;
            }
        }
    }
</script>

