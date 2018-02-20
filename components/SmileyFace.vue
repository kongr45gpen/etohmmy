<template>
    <svg
            width="6mm"
            height="6mm"
            viewBox="-45 -45 90 90"
            class="smiley"
    >
        <circle
                class="smiley-head"
                v-bind:style="{ fill: colour }"
                cx="0"
                cy="0"
                r="40" ></circle>
        <circle
                class="smiley-eye"
                cx="14"
                cy="-12"
                r="8" ></circle>
        <circle
                class="smiley-eye"
                cx="-14"
                cy="-12"
                r="8" ></circle>
        <path
                class="smiley-smile"
                v-bind:d="smileBezier"
                ></path>
    </svg>
</template>

<script>
    export default {
        name: "SmileyFace",
        props: {
            satisfaction: {
                type: Number,
                required: true
            }
        },
        computed: {
            colour: function() {
                return this.$getSatisfactionToColour(1.3, 0.8, 1)(this.satisfaction);
            },
            smileBezier: function () {
                let initY = -6.0 * (this.satisfaction/10.0 - 3.0) ;
                let control = 4.0 * this.satisfaction;
                let xMax = 20;

                return "m " + -xMax + "," + initY + " c 0,0 " + xMax + "," + control + " " + 2 * xMax +",0";
            }
        }
    }
</script>
