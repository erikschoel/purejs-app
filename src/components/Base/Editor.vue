<template>
  <vue-editor v-model="content" />
</template>

<script>
export default {
  data() {
    return {
      content: '<h1>Some initial content</h1>'
    }
  }
};
</script>
