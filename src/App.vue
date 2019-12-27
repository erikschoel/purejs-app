<template>
  <div id="app" :class="status">
    <router-view/>
    <loading-overlay :is-loading="isBusy" />
  </div>
</template>

<script>
import LoadingOverlay from '@/components/Base/LoadingOverlay';

export default {
  name: 'App',
  components: {
    LoadingOverlay
  },
  computed: {
    status() {
      return this.$store.getters['status'].type || 'idle';
    },
    isBusy() {
      return this.status !== 'idle';
    },
    hasError() {
      return !!this.$store.getters['error'];
    }
  }
}
</script>

<style lang="scss">
@import '../node_modules/codemirror/lib/codemirror.css';

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  box-sizing: border-box;
}

*, *:before, *:after {
  box-sizing: inherit;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  height: 100%;

  > div {
    display: flex;
  }

  .vld-icon {
    svg {
      display: none;
    }
  }

  &.complete .vld-icon {
    background-image: url(./assets/green-check.png);
    height: 150px;
    width: 150px;
    background-repeat: no-repeat;
    background-size: contain;
  }
  &.busy .vld-icon {
    svg {
      display: block;
    }
  }
}
</style>
