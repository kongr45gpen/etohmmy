import Vue from 'vue';

Vue.mixin({
    methods: {
        maxElements: function(collection, fetch) {
            let maxItems = [];
            let maxValue = null;

            _.each(collection, function(item, key) {
                if (item === undefined) return;

                let value = fetch(item, key);

                if (maxValue === null || value > maxValue + 0.001) { // Item a little bit larger
                    // Reset current array of items and add the new one
                    maxItems = [ key ];
                    maxValue = value;
                } else {
                    // Add the new equal item
                    if (Math.abs(value - maxValue) < 0.001) { // Items almost equal
                        maxItems.push(key);
                    }
                }
            });

            return maxItems;
        }
    }
});
