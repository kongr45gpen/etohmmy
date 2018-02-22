import Vue from 'vue';
import 'bootstrap';
import $ from 'jquery';
import Lessons from '../data/lessons.json'

import Deselect from '../components/Deselect.vue'
import Semester from '../components/Semester.vue'
import TotalResults from '../components/Results/TotalResults.vue'
import './mixins.js'


// CSS & HTML updating
import '../dist/main.css'
import '../index.html'

const Max_Satisfaction = 10;
const Total_Lessons = _.sum(Array.from(_.map(Lessons["semesters"], sem => sem.length)));

console.log("Welcome to BETHMMY. Counting " + _.size(Lessons["semesters"]) + " semesters and " + Total_Lessons + " lessons.");
// TODO: Localstorage versioning

// Initialise vue variables
_.each(Lessons["semesters"], function(s, skey) {
    _.each(s, function(l, key) {
        // Retrieve stored value from the client storage
        let storedValue = parseFloat(window.localStorage.getItem("etohmmy.lessons.satisfaction." + skey + "." + key));

        l["satisfaction"] = (!isNaN(storedValue)) ? storedValue : 0.0;
        l["deselected"] = false;
        l["semester"] = skey;
    })
});

// Define global vue properties
Vue.filter('nl2br', function (str) {
    if (!str) return '';
    return str.toString().trim().replace(/(?:\r\n|\r|\n)/g, '<br />');
});
Vue.prototype.$sectors = Lessons["sectors"];
Vue.prototype.$fakeSectors = Lessons["fake_sectors"];
Vue.prototype.$MaxSatisfaction = Max_Satisfaction;
Vue.prototype.$Total_Lessons = Total_Lessons;
Vue.prototype.$Choice_Factors_Literature = _.shuffle(['καθηγητές','εργαστήρια','ωρολόγιο πρόγραμμα','παρέες','δυνατότητες για διπλωματική',
    'απόψεις από το thmmy','υπάρχον υλικό για τα μαθήματα','επισκέψεις στις παραδόσεις', 'διαθέσιμα συγγράμματα',
    'συγκρούσεις ωρών μαθημάτων']).join(', ');
Vue.prototype.$getSatisfactionToColour = function(saturation = 1, brightness = 1, opacity = 1, override = false) {
    const maxValue = 255.0 * brightness;

    return function(satisfaction) {
        if (override) return "rgba(240,180,140,0.5)";

        let colour = [maxValue, maxValue, maxValue];

        const cf = saturation;

        if (satisfaction > 0) {
            // Linear interpolation
            colour[0] = maxValue * (1.0 - cf * 0.8 * satisfaction / Max_Satisfaction);
            colour[2] = maxValue * (1.0 - cf * 0.5 * satisfaction / Max_Satisfaction);
        } else {
            colour[1] = maxValue * (1.0 + cf * 0.7 * satisfaction / Max_Satisfaction);
            colour[2] = maxValue * (1.0 + cf * 0.8 * satisfaction / Max_Satisfaction);
        }

        // const opacity = opacity;

        return "rgba(" + Math.round(colour[0]) + "," + Math.round(colour[1]) + "," + Math.round(colour[2]) + "," + opacity + ")";
    }
};

let app = new Vue({
    el: '#app',
    data: {
        semesters: Lessons["semesters"],
        results: {},
        webpack_reload_count: 0
    },
    computed: {
        activeLessons: function() {
            return _.sum(
                Array.from(_.map(this.semesters,
                    sem => _.sumBy(sem, l => !l.deselected ? 1 : 0)
                )))
        }
    },
    components: {
        Semester, TotalResults, Deselect
    },
    mounted() {
        this.$nextTick(function() {
            $('[data-toggle="tooltip"]').tooltip();
        })
    },
    methods: {
        reset: function () {
            window.localStorage.clear();
            _.each(Lessons["semesters"], function (s) {
                _.each(s, function (l, key) {
                    l.satisfaction = 0.0;
                    l.deselected = false;
                })
            });
            this.$emit('update:offsect', 1);
        }
    }
});

// Export values so they can be accessed in the developer console
window.lessons = Lessons;
window.app = app;
window.Vue = Vue;

if (module.hot) {
    // Whenever the website is updated, increase the update counter in the top of the page.
    // This is useful so that there is no ambiguity if no changes are shown.
    // This does not work when the entire page reloads, in which a visual cue is shown by the
    // browser anyway.
    module.hot.addStatusHandler(function(status) {
        if (status === "apply") {
            app.webpack_reload_count++;
        }
    })
}
