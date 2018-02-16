<template>
    <div class="list-group-item lesson-list-item" v-bind:style="{ backgroundColor: colour }">
        <input type="range" class="lesson-list-range" min="-10" max="10" step="0.1" data-value="0" v-model.number="lesson.satisfaction">
        {{ lesson.name }}
    </div>
</template>

<script>
    const Max_Satisfaction = 10;

    export default {
        name: "LessonOptions",
        props: {
            // Property: lesson
            lesson: {
                type: Object,
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
            }
        }
    }
</script>
