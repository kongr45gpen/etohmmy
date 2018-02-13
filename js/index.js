import Vue from 'vue';
import Lessons from '../data/lessons.json'


console.log("Welcome to BETHMMY.");

var app = new Vue({
    el: '#app',
    data: {
        semesters: Lessons["semesters"],
    },
})

// Export values so they can be accessed in the developer console
window.lessons = Lessons
window.app = app
