<template>
    <div class="row">
        <div class="col-md">
            <form>
                <h3>Εξάμηνο {{ semester }}</h3>
                <div class="card lesson-list">
                    <div class="list-group list-group-flush">
                        <lesson-options v-for="(lesson, key) in lessons" :lesson="lesson" :key="key"></lesson-options>
                    </div>
                </div>
            </form>
        </div>
        <div class="col-md-7">
            <h1>Results</h1>
            <div class="card-deck">
                <!--<div class="col-md">-->
                <sector-results v-for="(sector, key, idx) in sectors" :lessons="lessons" :sector="sector" :alias="key" :key="idx"></sector-results>
                <!--</div>-->
            </div>


            <!--<p class="text-primary">Best Sector: <b><big>{{ sectors[results[semester]["maxSector"]].short_name }}</big></b></p>-->
        </div>
    </div>
</template>

<script>
    import LessonOptions from '../components/LessonOptions.vue'
    import SectorResults from '../components/Results/SectorResults.vue'

    export default {
        name: "Semester",
        props: {
            lessons: {
                type: Array,
                required: true
            },
            semester: {
                type: Number,
                required: true
            },
            sectors: {
                type: Object,
                required: true
            }
        },
        components: {
            LessonOptions,
            SectorResults
        }
    }
</script>

