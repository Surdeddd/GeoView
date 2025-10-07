import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style.js";

export function useMapLayers() {
  const semSrc = new VectorSource({
    url: "/data/semaphores.json",
    format: new GeoJSON(),
  });
  const lineSrc = new VectorSource({
    url: "/data/line.json",
    format: new GeoJSON(),
  });
  const roadSrc = new VectorSource({
    url: "/data/road_cros.json",
    format: new GeoJSON(),
  });
  const stPoint = new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: "#2563eb" }),
      stroke: new Stroke({ color: "#ffffff", width: 2 }),
    }),
  });
  const stLine = new Style({
    stroke: new Stroke({ color: "#10b981", width: 3 }),
  });
  const stPoly = new Style({
    stroke: new Stroke({ color: "#ef4444", width: 2 }),
    fill: new Fill({ color: "rgba(239,68,68,0.2)" }),
  });

  const stHover = new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color: "#f59e0b" }),
      stroke: new Stroke({ color: "#111827", width: 2 }),
    }),
    stroke: new Stroke({ color: "#f59e0b", width: 4 }),
    fill: new Fill({ color: "rgba(245,158,11,0.15)" }),
  });

  const semLayer = new VectorLayer({ source: semSrc, style: () => stPoint });
  const lineLayer = new VectorLayer({ source: lineSrc, style: () => stLine });
  const roadLayer = new VectorLayer({ source: roadSrc, style: () => stPoly });

  function clearHoverForId(hoverId: string | number | null) {
    if (hoverId == null) return;
    [semLayer, lineLayer, roadLayer].forEach((layer) => {
      layer
        .getSource()
        ?.getFeatures()
        .forEach((f) => {
          const id = f.getId?.() ?? (f as any).ol_uid;
          if (id === hoverId) {
            const prev = f.get("_prevStyle");
            f.setStyle(prev ?? undefined);
            f.unset("_prevStyle", true);
          }
        });
    });
  }

  return {
    sources: { semSrc, lineSrc, roadSrc },
    layers: { semLayer, lineLayer, roadLayer },
    styles: { stPoint, stLine, stPoly, stHover },
    clearHoverForId,
  };
}
