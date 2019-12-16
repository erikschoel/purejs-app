<template>
  <div class="home">
    <code-browser />
  </div>
</template>

<script>
import CodeBrowser from 'components/Content/CodeBrowser';

export default {
  name: 'Home',
  components: {
    CodeBrowser
  },
  data() {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  computed: {
    currentItemRef() {
      return this.$store.getters['currentItemRef'];
    },
    currentItemNamespace() {
      return this.currentItemRef.length ? this.currentItemRef[0] : '-';
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home {
  height: 100%;
}
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
