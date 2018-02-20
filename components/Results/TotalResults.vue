<template>
    <div class="card-deck">
        <div class="card result-sector" v-for="(sector, skey) in $sectors"  >
            <h5 class="card-header" v-bind:class="[ 'bg-' + sector.bootstrap_colour ]">Τομέας <b>{{ sector.subtitle_name }}</b></h5>
            <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="semester in semesters" :class="(results[semester].maxSector === skey) ? 'bg-' + sector.bootstrap_colour : ''">
                    <div class="row">
                        <strong class="col-3">Εξάμηνο {{ semester }}</strong>
                        <span class="col-5">
                            <span :class="(results[semester].maxSector !== skey) ? 'text-muted' : ''">Βαθμολογία:</span>
                            <span class="badge badge-pill badge-dark">
                                {{ results[semester].satisfaction[skey].toFixed(1) }}
                            </span>
                        </span>
                    </div>
                </li>
            </ul>

            <div class="card-footer" :class="(maxSector === skey) ? 'bg-' + sector.bootstrap_colour : ''">
                <small :class="(maxSector !== skey) ? 'text-muted' : ''">Συνολική Βαθμολογία: </small>
                {{ sums[skey].toFixed(1) }}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "TotalResults",
        props: {
            semesters: {
                type: Array,
                required: true
            },
            results: {
                type: Object,
                required: true
            }
        },
        computed: {
            sums: function() {
                let output = {};
                const results = this.results;

                _.each(this.$sectors, function (sector, skey) {
                    output[skey] = _.reduce(results, function (sum, it) {
                        return sum + it.satisfaction[skey];
                    }, 0.0);
                });

                return output;
            },
            maxSector: function() {
                let max = null;

                // Todo: What if there are multiple max values?
                for (let sec in this.sums) {
                    if (max === null || this.sums[sec] > this.sums[max]) {
                        max = sec;
                    }
                }

                console.log(max);

                return max;
            }
        }
    }
</script>
