import Vue from 'vue';
import Lessons from '../data/lessons.json'


console.log("Welcome to BETHMMY.");

var app = new Vue({
    el: '#app',
    data: {
        semesters: Lessons["semesters"]
    }
})

console.log(Lessons)
window.lessons = Lessons
