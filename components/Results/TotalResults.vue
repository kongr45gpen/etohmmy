<template>
    <div>
        <div class="card-deck">
            <div class="card result-sector" v-for="(sector, skey) in $sectors"  >
                <h5 class="card-header" v-bind:class="[ 'bg-' + sector.bootstrap_colour ]">Τομέας <b>{{ sector.subtitle_name }}</b></h5>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item"
                        v-for="semester in semesters"
                        :class="results[semester].maxSectors.includes(skey) ? 'bg-' + sector.bootstrap_colour : ''">
                        <div class="row">
                            <strong class="col-3">Εξάμηνο {{ semester }}</strong>
                            <span class="col-5">
                                <span :class="!results[semester].maxSectors.includes(skey) ? 'text-muted' : ''">Βαθμολογία:</span>
                                <span class="badge badge-pill" :class="results[semester].maxSectors.includes(skey) ? 'badge-dark' : 'badge-secondary'">
                                    {{(results[semester].satisfaction[skey] !== undefined) ? results[semester].satisfaction[skey].toFixed(1) : 0.0}}
                                </span>
                            </span>
                        </div>
                    </li>
                </ul>

                <div class="card-footer" :class="maxSectors.includes(skey) ? 'bg-' + sector.bootstrap_colour : ''">
                    <small :class="!maxSectors.includes(skey) ? 'text-muted' : ''">Συνολική Βαθμολογία: </small>
                    {{ sums[skey].toFixed(1) }}
                </div>
            </div>
        </div>

        <div class="text-center m-4">
            Τελική Επιλογή Τομέα:
            <div class="card sector-final p-4" :class="[ 'bg-' + $sectors[maxSectors[0]].bootstrap_colour ]">
                <span class="lead">Τομέας <strong>{{ maxSectors.map(s => $sectors[s].subtitle_name).join(', ') }}</strong></span>
            </div>

            <p v-for="sector in badSectors" class="my-2">
                <!-- TODO: Too many magic numbers -->
                {{ (100.0 * (sums[maxSectors[0]] - sums[sector]) / (4*70.0)).toFixed(1) }}% καλύτερα από τον τομέα {{ $sectors[sector].subtitle_name }}
            </p>
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
            maxSectors: function() {
                const sums = this.sums;

                return this.maxElements(this.sums, sat => sat);
            },
            badSectors: function() {
                let keys = _.keys(this.$sectors);
                keys.splice(keys.indexOf(this.maxSectors[0]),1);
                return keys;
            }
        }
    }
</script>
