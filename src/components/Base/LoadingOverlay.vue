<template>
  <div class="loading-overlay-container">
    <loading :active.sync="showLoading" :can-cancel="canCancel" :on-cancel="onCancel" :is-full-page="fullPage"></loading>
  </div>
</template>

<script>
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    canCancel: {
      type: Boolean,
      default: false
    },
    fullPage: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      stopLoading: false
    }
  },
  components: {
    Loading
  },
  computed: {
    showLoading() {
      return this.isLoading && !this.stopLoading;
    }
  },
  methods: {
    stopLoader() {
      this.stopLoading = true;
    },
    resumeLoader() {
      this.stopLoading = false;
    },
    onCancel() {
      this.stopLoading();
      this.$emit('loader-cancelled');
    }
  }
}
</script>

<style lang="scss">
.loading-overlay-container {
  .vld-overlay.is-full-page {
    z-index: 1000000;
  }
}
</style>
