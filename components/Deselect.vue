<template>
    <div class="row justify-content-around sector-deselection mx-auto my-4">
        <a class="card"
           v-for="(sector, skey) in $sectors"
           :class="(offSector === skey) ? ['card-secondary','text-muted','disabled','border-danger'] : 'bg-' + sector.bootstrap_colour"
           @click="toggle(skey)">
            <div class="card-body">
                <h5>{{ sector.name }}</h5>
            </div>
        </a>
    </div>
</template>

<script>
    function restoreAllLessons(lessons) {
        _.each(lessons, function(s, semester) {
            _.each(s, function(l, lkey) {
                if (l.deselected) {
                    if(l.satisfaction < -9.999) {
                        // Restore stored value
                        l.satisfaction = parseFloat(window.localStorage.getItem("etohmmy.lessons.satisfaction." + semester + "." + lkey))
                        if (isNaN(l.satisfaction)) l.satisfaction = 0.0;
                    }
                    l.deselected = false;
                }
            });
        })
    }

    export default {
        name: "Deselect",
        data: function() {
            return {
                offSector: window.localStorage.getItem("etohmmy.off_sector")
            };
        },
        props: {
            lessons: {
                type: Object,
                required: true
            },

        },
        computed: {
            allSectors: function() {
                return Object.assign({}, this.$sectors, this.$fakeSectors);
            }
        },
        methods: {
            toggle: function(sector, force = false) {
                window.localStorage.setItem("etohmmy.off_sector", sector);
                if (sector === null || sector === undefined) {
                    // Nothing to do
                } else if (this.offSector === sector && !force) {
                    // Disabled sector has been deactivated
                    this.offSector = null;

                    window.localStorage.setItem("etohmmy.off_sector", null);

                    // De-negative all lessons
                    restoreAllLessons(this.lessons);
                } else {
                    this.offSector = sector;

                    restoreAllLessons(this.lessons);

                    // Set all lessons to -10
                    _.each(this.lessons, function(s, semester) {
                        _.each(s, function(l, lkey) {
                            if (l.sector === sector) {
                                l.satisfaction = -10;
                                l.deselected =  true;
                            }
                        });
                    })
                }
            },
            reset: function() {
                this.toggle(this.offSector);
            }
        },
        created: function() {
            this.$parent.$on('update:offsect', this.reset);
            this.toggle(this.offSector, true);

        }
    }
</script>

