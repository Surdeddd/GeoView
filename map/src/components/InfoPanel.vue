<template>
  <transition name="fade">
    <div v-if="isOpen && featureProps" class="info-modal">
      <header class="info-modal__header">
        <h3>Информация об объекте</h3>
        <button class="close-btn" @click="close">✕</button>
      </header>
      <div class="info-modal__list">
        <div
          v-for="(val, key) in featureProps"
          :key="String(key)"
          class="info-modal__row"
        >
          <h4>{{ key }}</h4>
          <p>{{ formatVal(val) }}</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { storeToRefs } from "pinia";

  const featureStore = useSelectedFeatureStore();
  const { featureProps } = storeToRefs(featureStore);

  const infoModal = useInfoModalStore();
  const { isOpen } = storeToRefs(infoModal);
  const { close } = infoModal;

  const formatVal = (v: unknown) => {
    if (v == null) return "—";
    if (typeof v === "object") return JSON.stringify(v, null, 2);
    return String(v);
  };
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.25s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  .info-modal {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
    padding: 16px 20px;
    width: 340px;
    max-height: 85vh;
    overflow-y: auto;
    z-index: 999;
    backdrop-filter: blur(8px);
    font-family: "Inter", sans-serif;
  }

  .info-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .info-modal__header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .close-btn {
    border: none;
    font-size: 18px;
    color: #6b7280;
    cursor: pointer;
  }

  .info-modal__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .info-modal__row {
    display: flex;
    justify-content: space-between;
    align-items: start;
    border-bottom: 1px solid #f3f4f6;
    padding: 4px 0;
  }
  .info-modal__row h4 {
    font-size: 14px;
    color: #4b5563;
    margin: 0;
    text-transform: capitalize;
  }
  .info-modal__row p {
    font-size: 14px;
    color: #111827;
    margin: 0;
    text-align: right;
    word-break: break-word;
  }
</style>
