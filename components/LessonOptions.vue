<template>
    <a class="list-group-item lesson-list-item flex-column align-items-start" v-bind:style="{ backgroundColor: colour }" data-toggle="collapse" v-bind:data-target="'#' + collapsibleId">
        <div class="d-flex w-100 justify-content-between align-items-center">
            <span class="col-4 font-weight-bold">{{ lesson.name }}</span>
            <small class="col-2 text-muted">{{ shortProfessors.join(", ") }}</small>
            <input class="col-3 lesson-list-range" type="range" min="-10" max="10" step="0.1" data-value="0" v-model.number="lesson.satisfaction" v-on:change="changeCompleted">
            <span class="col-1 flex-column d-flex align-items-center justify-content-center lesson-ects">
                <span class="font-weight-bold">{{ lesson.ects }}</span>
                <span class="text-muted font-weight-light"><small>ECTS</small></span>
            </span>
            <span class="col">
                <a v-bind:href="lesson.qa" class="lesson-utility-icon">
                    <font-awesome-icon :icon="faComment" fixed-width />
                </a>
                <a v-bind:href="lesson.qa" class="lesson-utility-icon">
                    <font-awesome-icon :icon="faInfo" fixed-width />
                </a>
                <a class="lesson-utility-icon" href="#" data-toggle="collapse" v-bind:data-target="'#' + collapsibleId" aria-expanded="false" v-bind:aria-controls="collapsibleId">
                    <font-awesome-icon :icon="faChevronRight" fixed-width />
                </a>
            </span>
        </div>

        <div class="collapse multi-collapse" v-bind:id="collapsibleId" v-bind:data-parent="'#' + parentId">
            <p class="mb-1">
                {{ lesson.description.syllabus }}
                QA: <a v-bind:href="lesson.qa">{{lesson.qa}}</a>
            </p>
        </div>
    </a>
</template>

<!--<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">-->
    <!--<div class="d-flex w-100 justify-content-between">-->
        <!--<h5 class="mb-1">List group item heading</h5>-->
        <!--<small class="text-muted">3 days ago</small>-->
    <!--</div>-->
    <!--<p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>-->
    <!--<small class="text-muted">Donec id elit non mi porta.</small>-->
<!--</a>-->

<script>
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
    import faInfo from '@fortawesome/fontawesome-free-solid/faInfo'
    import faChevronRight from '@fortawesome/fontawesome-free-solid/faChevronRight'
    import faComment from '@fortawesome/fontawesome-free-solid/faComment'

    const Max_Satisfaction = 10;

    export default {
        name: "LessonOptions",
        components: { FontAwesomeIcon },
        data() { return {faChevronRight: faChevronRight, faInfo: faInfo, faComment: faComment} },
        props: {
            // Property: lesson
            lesson: {
                type: Object,
                required: true
            },
            semester: {
                // TODO: Should be number
                type: String,
                required: true
            }
        },
        computed: {
            colour: function() {
                let colour = [255, 255, 255];

                if (this.lesson.satisfaction > 0) {
                    // Linear interpolation
                    colour[0] = 255 * (1.0 - 0.8 * this.lesson.satisfaction / Max_Satisfaction);
                    colour[2] = 255 * (1.0 - 0.5 * this.lesson.satisfaction / Max_Satisfaction);
                } else {
                    colour[1] = 255 * (1.0 + 0.7 * this.lesson.satisfaction / Max_Satisfaction);
                    colour[2] = 255 * (1.0 + 0.8 * this.lesson.satisfaction / Max_Satisfaction);
                }

                const opacity = 0.7;

                return "rgba(" + Math.round(colour[0]) + "," + Math.round(colour[1]) + "," + Math.round(colour[2]) + "," + opacity + ")";
            },
            collapsibleId: function() {
                return 'lessonDescription-' + this.semester + '-' + this.$vnode.key;
            },
            parentId: function() {
                return 'lessonOptions-' + this.semester
            },
            shortProfessors: function() {
                let array = [];
                _.each(this.lesson.professors, function(professor) {
                    let splitProfessor = professor.split(' ');
                    let output = splitProfessor.slice(0, -1).map(name => (name.length > 0) ? name[0] + '. ' : '').join()
                        + splitProfessor.slice(-1).join();

                    array.push(output);
                });

                return array;
            }
        },
        methods: {
            changeCompleted: function() {
                // Store the value in the local storage
                window.localStorage.setItem("etohmmy.lessons.satisfaction." + this.$vnode.key, this.lesson.satisfaction);
            }
        }
    }
</script>
