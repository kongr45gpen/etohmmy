<template>
    <div class="list-group-item lesson-list-item flex-column align-items-start"
       v-bind:style="{ backgroundColor: colour }"
       v-bind:class="(lesson.deselected && lesson.satisfaction === -10) ? 'lesson-list-item-deselected' : ''"
       v-bind:data-target="'#' + collapsibleId"
       onclick=""
    data-toggle="collapse"
    >
        <!-- onclick="" Workaround for iOS not registering click events-->
        <div class="d-flex w-100 justify-content-between align-items-center"

        >
            <span class="col-4 col-xl-4 font-weight-bold" data-toggle="collapse">{{ lesson.name }}</span>
            <small class="col-2 d-none d-sm-block col-xl-2 text-muted lesson-professors"
                   data-toggle="tooltip" data-html="true" data-placement="top"
                   :data-title="lesson.professors.join('<br>')">{{ shortProfessors.join(", ") }}</small>
            <span class="col-1 d-none d-md-flex col-xl-1 flex-column align-items-center justify-content-center lesson-ects">
                <span class="font-weight-bold">{{ lesson.ects }}</span>
                <span class="text-muted font-weight-light"><small>ECTS</small></span>
            </span>

            <!-- Stop event propagation on click, so that the accordion doesn't toggle when the range is changed -->
            <!--<div class="col-2 col-xl-4 d-flex align-items-center">-->
            <div class="d-flex col align-items-center">
                <div class="lesson-list-smiley">
                    <smiley-face class="lesson-list-smiley" :satisfaction="lesson.satisfaction"></smiley-face>
                </div>
                <div class="lesson-list-range">
                    <input title="Βαθμολογία" type="range" min="-10" max="10" step="0.1" data-value="0" v-model.number="lesson.satisfaction" v-on:click.stop v-on:change="changeCompleted">
                </div>
            <!--<span class="col d-flex">-->
                <a v-if="lesson.thmmy !== undefined" v-bind:href="lesson.thmmy" class="lesson-utility-icon" v-on:click.stop>
                    <font-awesome-icon :icon="faComment" fixed-width />
                </a>
                <a v-else class="lesson-utility-icon">
                    <i class="fa fa-w-18 d-sm-inline-block fa-fw"></i>
                </a>
                <a v-bind:href="lesson.qa" class="lesson-utility-icon" v-on:click.stop>
                    <font-awesome-icon :icon="faInfo" fixed-width />
                </a>
                <a class="lesson-utility-icon" href="#" data-toggle="collapse" v-bind:data-target="'#' + collapsibleId" aria-expanded="false" v-bind:aria-controls="collapsibleId">
                    <font-awesome-icon :icon="faChevronRight" fixed-width />
                </a>
            <!--</span>-->
            </div>

        </div>

        <div class="collapse multi-collapse" v-bind:id="collapsibleId" v-bind:data-parent="'#' + parentId" v-on:click.stop>
            <div class="mb-1 lesson-description">
                <p v-html="$options.filters.nl2br(lesson.description.syllabus)"></p>

                <div class="row no-gutters">
                    <strong class="lesson-property-key" v-if="lesson.professors.length === 1">Καθηγητής</strong>
                    <strong class="lesson-property-key" v-else>Καθηγητές</strong>
                    <span class="lesson-property-value">{{ lesson.professors.join(", ") }}</span>
                </div>

                <div class="row no-gutters align-items-center">
                    <strong class="lesson-property-key">Επιλογή</strong>
                    <div class="lesson-property-value">
                        <div class="btn-toolbar lesson-sector-toolbar">
                            <template v-for="(sector, key) in $sectors">
                                <div class="btn-group btn-group-sm mr-2 my-1" role="group">
                                    <div class="btn btn-dark border-dark">{{ sector.short_name }}</div>

                                    <div class="btn btn-warning border-dark" v-if="lesson.status[key] === 'Y'">Υποχρεωτικό</div>
                                    <div class="btn btn-primary border-dark" v-else-if="lesson.status[key] === 'ET'">Επιλογής (Τομέα)</div>
                                    <div class="btn btn-secondary border-dark" v-else-if="lesson.status[key] === 'E'">Επιλογής</div>
                                    <div class="btn btn-secondary border-dark" v-else-if="lesson.status[key] === 'EE'">Ελεύθ. Επιλ.</div>
                                    <div class="btn btn-light border-dark" v-else><span class="px-4"></span></div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <div class="row no-gutters" v-if="lesson.qa !== undefined">
                    <strong class="lesson-property-key">Πληροφορίες</strong>
                    <span class="lesson-property-value lesson-property-protect">
                        <a :href="lesson.qa">{{  lesson.qa  }}</a>
                    </span>
                </div>

                <div class="row no-gutters" v-if="lesson.thmmy !== undefined">
                    <strong class="lesson-property-key">Συζήτηση</strong>
                    <span class="lesson-property-value lesson-property-protect">
                        <a :href="lesson.thmmy">{{  lesson.thmmy  }}</a>
                    </span>
                </div>

                <!-- Hidden so as not to influence the decision -->
                <!--<div class="row no-gutters" v-if="$sectors[lesson.sector] !== undefined">-->
                    <!--<strong class="lesson-property-key">Τομέας</strong>-->
                    <!--<span class="lesson-property-value">-->
                        <!--{{  $sectors[lesson.sector].subtitle_name  }}-->
                    <!--</span>-->
                <!--</div>-->

                <div class="row no-gutters align-items-center">
                    <strong class="lesson-property-key lesson-property-protect">Βαθμολογία</strong>
                    <span class="lesson-property-value d-flex align-items-center">
                        <input title="Βαθμολογία" class="lesson-aux-satisfaction" type="range" min="-10" max="10" step="0.01" v-model.number="lesson.satisfaction" v-on:change="changeCompleted">
                        <div class="btn-group btn-group-sm mt-1">
                            <div class="btn btn-outline-dark border-dark">{{ lesson.satisfaction.toFixed(1) }}</div>
                            <a class="btn btn-outline-danger lesson-aux-reset"
                               v-on:click="lesson.satisfaction = 0; changeCompleted();">
                                <span class="d-none d-sm-inline">Reset</span>
                                <span class="d-sm-none"><font-awesome-icon :icon="faReply"></font-awesome-icon></span>
                            </a>
                        </div>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
    import faInfo from '@fortawesome/fontawesome-free-solid/faInfo'
    import faChevronRight from '@fortawesome/fontawesome-free-solid/faChevronRight'
    import faComment from '@fortawesome/fontawesome-free-solid/faComment'
    import faReply from '@fortawesome/fontawesome-free-solid/faReply'
    import SmileyFace from './SmileyFace.vue';

    export default {
        name: "LessonOptions",
        components: { SmileyFace, FontAwesomeIcon },
        data() { return {faChevronRight: faChevronRight, faInfo: faInfo, faComment: faComment, faReply: faReply} },
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
                return this.$getSatisfactionToColour(0.7, 1, 0.7, this.lesson.deselected && this.lesson.satisfaction < -9.999)(this.lesson.satisfaction);
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
                console.log("value stored in local storage");
                // Store the value in the local storage
                window.localStorage.setItem("etohmmy.lessons.satisfaction." + this.semester + "." + this.$vnode.key, this.lesson.satisfaction);
            }
        }
    }
</script>
