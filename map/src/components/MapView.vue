<template>
  <div ref="mapEl" class="map-container">
    <div
      v-if="tooltip.visible"
      class="map-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      {{ tooltip.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import LayerSwitcherImage from "ol-ext/control/LayerSwitcherImage.js";
  import { defaults as defaultControls } from "ol/control.js";
  import FullScreen from "ol/control/FullScreen.js";
  import ZoomSlider from "ol/control/ZoomSlider.js";
  import Feature from "ol/Feature.js";
  import { defaults as defaultInteractions } from "ol/interaction.js";
  import TileLayer from "ol/layer/Tile.js";
  import Map from "ol/Map.js";
  import { fromLonLat, toLonLat } from "ol/proj.js";
  import OSM from "ol/source/OSM.js";
  import View from "ol/View.js";
  import { onBeforeUnmount, onMounted, ref } from "vue";

  import "ol-ext/dist/ol-ext.css";
  import "ol/ol.css";

  const panorama = usePanoramaStore();
  const infoModal = useInfoModalStore();
  const featureStore = useSelectedFeatureStore();

  const mapEl = ref<HTMLDivElement | null>(null);
  let map: Map | undefined;
  let hoverFeatureId: string | number | null = null;

  const { layers, styles, clearHoverForId } = useMapLayers();
  const tooltip = ref({ visible: false, x: 0, y: 0, text: "" });

  onMounted(() => {
    if (!mapEl.value) return;

    map = new Map({
      target: mapEl.value,
      layers: [
        new TileLayer({ source: new OSM() }),
        layers.roadLayer,
        layers.lineLayer,
        layers.semLayer,
      ],
      view: new View({
        center: fromLonLat([38.9747, 45.0355]),
        zoom: 13,
      }),
      controls: defaultControls({ attribution: false }),
      interactions: defaultInteractions({ doubleClickZoom: false }),
    });

    map.addControl(new ZoomSlider());
    map.addControl(new LayerSwitcherImage({ collapsed: true }));
    map.addControl(new FullScreen());

    map.on("pointermove", (evt) => {
      if (!map) return;

      const pixel = evt.pixel;
      let found = false;

      map.forEachFeatureAtPixel(pixel, (f) => {
        if (!(f instanceof Feature)) return;
        found = true;

        const id = f.getId?.() ?? (f as any).ol_uid;
        if (hoverFeatureId !== id) {
          clearHoverForId(hoverFeatureId);
          hoverFeatureId = id;
          f.set("_prevStyle", f.getStyle?.());
          f.setStyle(styles.stHover);
        }
        return true;
      });

      const coords = toLonLat(evt.coordinate);
      if (!coords) return;

      const [lon = 0, lat = 0] = coords;
      tooltip.value = {
        visible: true,
        x: pixel[0] ?? 0,
        y: pixel[1] ?? 0,
        text: `${lon.toFixed(5)}, ${lat.toFixed(5)}`,
      };

      if (!found) {
        tooltip.value.visible = false;
        clearHoverForId(hoverFeatureId);
        hoverFeatureId = null;
      }
    });

    map.on("singleclick", (evt) => {
      let selected: Record<string, unknown> | null = null;

      map?.forEachFeatureAtPixel(evt.pixel, (f) => {
        selected = f.getProperties();
        delete (selected as any).geometry;
        return true;
      });
      if (selected) {
        featureStore.setFeature(selected);
        infoModal.open();
      } else {
        featureStore.clear();
        infoModal.close();
      }
    });

    map.on("dblclick", (evt) => {
      let foundFeature = false;
      map?.forEachFeatureAtPixel(evt.pixel, (f) => {
        foundFeature = true;
        const props = f.getProperties();
        delete (props as any).geometry;
        return true;
      });
      if (foundFeature) panorama.open();
    });
  });

  onBeforeUnmount(() => {
    if (map) map.setTarget(undefined);
    map = undefined;
  });
</script>

<style scoped>
  .map-container {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    overflow: hidden;
  }

  .map-tooltip {
    position: absolute;
    pointer-events: none;
    z-index: 10;
    padding: 4px 8px;
    background: rgba(17, 24, 39, 0.9);
    color: #fff;
    border-radius: 6px;
    font-size: 12px;
    transform: translate(8px, -28px);
    white-space: nowrap;
  }
</style>
