import Vue from 'vue';
import _ from '../node_modules/underscore/underscore.js';
import Lessons from '../data/lessons.json'

import DemoThingy from '../components/DemoThingy.vue'
import Semester from '../components/Semester.vue'


// CSS & HTML updating
import '../css/main.css'
import '../index.html'

console.log("Welcome to BETHMMY.");

// Initialise vue variables
_.each(Lessons["semesters"], function(s) {
    _.each(s, function(l) {
        l["satisfaction"] = 0.0;
    })
});

var nav = new Vue({
    el: '#nav',
    data: {
        webpack_reload_count: 0
    }
});

var app = new Vue({
    el: '#app',
    data: {
        semesters: Lessons["semesters"],
        sectors: Lessons["sectors"],
        sample: "teste text",
    },
    components: {
        DemoThingy,
        Semester
    }
})

// Export values so they can be accessed in the developer console
window.lessons = Lessons
window.app = app

if (module.hot) {
    // Whenever the website is updated, increase the update counter in the top of the page.
    // This is useful so that there is no ambiguity if no changes are shown.
    // This does not work when the entire page reloads, in which a visual cue is shown by the
    // browser anyway.
    module.hot.addStatusHandler(function(status) {
        if (status === "apply") {
            nav.webpack_reload_count++;
        }
    })
}
