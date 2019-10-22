<template>
  <div :style="style" ref="self">
    <slot></slot>
  </div>
</template>
<script>
import {
  getRepeatPieces,
  getPadding,
  getScaleFactor,
  drawBackground,
  throttle
} from "./nine-patch.util";
// const MINIMAL_TRANSPARENT =
//   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=";
export default {
  name: "NinePatch",
  props: {
    src: String
  },
  data() {
    return {
      originCanvas: null,
      originContext: null,
      markData: null, // data of edges
      bgCanvas: null,
      bgContext: null,
      padding: null,
      bgData: null,
      observer: null,
      prevSize: null
    };
  },
  computed: {
    style: function() {
      return {
        background: this.bgData
          ? `url(${this.bgData}) no-repeat 0 0/100% 100%`
          : null,
        padding: this.padding ? this.padding.map(p => p + "px").join(" ") : null
      };
    }
  },
  mounted: function() {
    this.patch();
    const resizer = throttle(() => {
      const width = this.$refs.self.parentNode.clientWidth;
      const height = this.$refs.self.parentNode.clientHeight;
      if (
        !this.prevSize ||
        (this.prevSize &&
          (this.prevSize[0] !== width || this.prevSize[1] !== height))
      ) {
        this.resize();
      }
      this.prevSize = [width, height];
    }, 300);
    this.observer = new MutationObserver(ml => {
      if (ml.some(v => v.attributeName === "style")) {
        resizer();
      }
    });
    this.observer.observe(this.$refs.self.parentNode, {
      attributes: true
    });
  },
  destroyed: function() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    patch: function() {
      const pts = this.src.split(".").reverse();
      if (pts[0] === "png" && pts[1] === "9") {
        const img = new Image();
        img.addEventListener("load", () => {
          this.originCanvas = document.createElement("canvas");
          this.$nextTick(() => {
            this.originCanvas.width = img.width;
            this.originCanvas.height = img.height;
            this.originContext = this.originCanvas.getContext("2d");
            this.originContext.drawImage(img, 0, 0);
            // data of four edges
            const repeatHorizontal = getRepeatPieces(
              this.originContext.getImageData(0, 0, this.originCanvas.width, 1)
                .data
            );
            const repeatVertical = getRepeatPieces(
              this.originContext.getImageData(0, 0, 1, this.originCanvas.height)
                .data
            );
            const contentHorizontal = getRepeatPieces(
              this.originContext.getImageData(
                0,
                this.originCanvas.height - 1,
                this.originCanvas.width,
                1
              ).data
            );
            const contentVertical = getRepeatPieces(
              this.originContext.getImageData(
                this.originCanvas.width - 1,
                0,
                1,
                this.originCanvas.height
              ).data
            );
            this.markData = {
              repeatHorizontal,
              repeatVertical,
              contentHorizontal,
              contentVertical
            };
            // handle illegal pic
            if (
              repeatHorizontal.some(r => r.repeat) &&
              repeatVertical.some(r => r.repeat)
            ) {
              this.resize();
            } else {
              this.bgData = this.src;
            }
          });
        });
        img.src = this.src;
      } else {
        this.bgData = this.src;
      }
    },
    resize: function() {
      if (!this.markData) {
        return;
      }
      this.padding = getPadding(this.markData, this.originCanvas);
      const selfWidth = this.$refs.self.clientWidth;
      const selfHeight = this.$refs.self.clientHeight;
      if (!selfWidth || !selfHeight) {
        return;
      }
      const [widthFactor, heightFactor] = getScaleFactor(
        this.markData,
        this.originCanvas,
        selfWidth,
        selfHeight
      );

      this.bgCanvas = document.createElement("canvas");
      this.bgCanvas.width = selfWidth;
      this.bgCanvas.height = selfHeight;
      this.bgContext = this.bgCanvas.getContext("2d");

      this.bgData = drawBackground(
        this.markData,
        this.bgContext,
        this.originCanvas,
        this.bgCanvas,
        widthFactor,
        heightFactor
      );
    }
  }
};
</script>
<style scoped lang="scss">
div {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
</style>