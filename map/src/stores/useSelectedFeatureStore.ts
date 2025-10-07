import { defineStore } from "pinia";

export const useSelectedFeatureStore = defineStore("selectedFeature", () => {
  const featureProps = ref<Record<string, unknown> | null>(null);
  const setFeature = (props: Record<string, unknown> | null) => {
    featureProps.value = props;
  };
  const clear = () => {
    featureProps.value = null;
  };

  return { featureProps, setFeature, clear };
});
