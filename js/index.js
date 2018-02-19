import Vue from 'vue';
import 'bootstrap';
import Lessons from '../data/lessons.json'

import DemoThingy from '../components/DemoThingy.vue'
import Semester from '../components/Semester.vue'


// CSS & HTML updating
import '../css/main.css'
import '../index.html'

console.log("Welcome to BETHMMY.");
// TODO: Localstorage versioning

// Initialise vue variables
_.each(Lessons["semesters"], function(s) {
    _.each(s, function(l, key) {
        // Retrieve stored value from the client storage
        let storedValue = parseFloat(window.localStorage.getItem("etohmmy.lessons.satisfaction." + key));

        l["satisfaction"] = (!isNaN(storedValue)) ? storedValue : 0.0;
    })
});

// Define global vue properties
Vue.filter('nl2br', function (str) {
    if (!str) return '';
    return str.toString().replace(/(?:\r\n|\r|\n)/g, '<br />');
});
Vue.prototype.$sectors = Lessons["sectors"];

let nav = new Vue({
    el: '#nav',
    data: {
        webpack_reload_count: 0
    },
    methods: {
        reset: function () {
            window.localStorage.clear();
            _.each(Lessons["semesters"], function (s) {
                _.each(s, function (l, key) {
                    l.satisfaction = 0.0;
                })
            })
        }
    }
});

let app = new Vue({
    el: '#app',
    data: {
        semesters: Lessons["semesters"],
        sample: "teste text",
    },
    components: {
        DemoThingy,
        Semester
    },
    // updated() {
    //     this.$nextTick(function() {
    //     })
    // }
});

// Export values so they can be accessed in the developer console
window.lessons = Lessons;
window.app = app;

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
