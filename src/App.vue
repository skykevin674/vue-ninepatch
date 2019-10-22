<template>
  <div id="app">
    <grid-layout
      :layout.sync="plates"
      :col-num="4"
      :row-height="150"
      :is-draggable="false"
      :is-resizable="true"
      :is-mirrored="false"
      :vertical-compact="true"
      :margin="[10, 10]"
      :use-css-transforms="true"
    >
      <grid-item
        v-for="item in plates"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :key="item.i"
      ><NinePatch src="images/b16.9.png" ref="bg">NinePatch</NinePatch></grid-item>
    </grid-layout>
  </div>
</template>

<script>
import VueGridLayout from "vue-grid-layout";
export default {
  name: "app",
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  data() {
    return {
      plates: [
        { x: 0, y: 0, w: 1, h: 1, i: "0" },
        { x: 1, y: 0, w: 1, h: 1, i: "1" },
        { x: 2, y: 0, w: 1, h: 2, i: "2" },
        { x: 0, y: 1, w: 2, h: 1, i: "3" },
        { x: 0, y: 2, w: 3, h: 3, i: "4" },
        { x: 3, y: 0, w: 1, h: 5, i: "5" }
      ]
    };
  }
};
</script>

<style lang="scss">
html,
body {
  height: 100%;
  margin: 0;
  #app {
    height: 100%;
  }
}
</style>
