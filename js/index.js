import Vue from 'vue';
import _ from '../node_modules/underscore/underscore.js';
import Lessons from '../data/lessons.json'

import DemoThingy from '../components/DemoThingy.vue'
import LessonOptions from '../components/LessonOptions.vue'
import SectorResults from '../components/Results/SectorResults.vue'

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
        LessonOptions,
        SectorResults
    }
})

// Export values so they can be accessed in the developer console
window.lessons = Lessons
window.app = app

if (module.hot) {
    module.hot.addStatusHandler(function(status) {
        if (status === "apply") {
            nav.webpack_reload_count++;
        }
    })
}

// if (module.hot) {
//    module.hot.accept(function() {
//          console.log('Accepting the updated printMe module!');
//          printMe();
//        })
//  }
