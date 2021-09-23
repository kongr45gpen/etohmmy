<template>
    <li class="list-group-item d-flex align-items-center" v-bind:class="[ 'bg-light-' + lesson.sector, 'lesson-status-' + lesson.status[sector] ]">
        <span class="badge badge-lesson-status badge-danger" title="Υποχρεωτικό" v-if="lesson.status[sector] === 'Y'">Y</span>
        <span class="badge badge-lesson-status badge-danger" title="Επιλογής (Τομέα)" v-if="lesson.reason === 'ET'">E!</span>
        <span class="badge badge-lesson-status badge-info" title="Επιλογής (Τομέα), ανεξάρτητα επιλεγμένο" v-else-if="lesson.status[sector] === 'ET'">E!</span>
        <span class="badge badge-lesson-status badge-secondary" title="Επιλογής" v-if="lesson.status[sector] === 'E'">E</span>
        <span class="badge badge-lesson-status badge-light" title="Ελεύθερης Επιλογής" v-if="lesson.status[sector] === 'EE'">EE</span>
        <span class="flex-fill">{{ lesson.name }}</span>
        <span class="badge badge-dark float-right">{{ lesson.satisfaction.toFixed(1) }}</span>
    </li>
</template>

<script>
    export default {
        name: "LessonResults",
        data: function() { return { key: 0 }},
        props: {
            // Property: lesson
            lesson: {
                type: Object,
                required: true
            },
            sector: {}
        }
    }
</script>

