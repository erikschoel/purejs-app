<template>
  <div class="code-editor">
    <textarea :id="name"></textarea>
  </div>
</template>

<script>
import CodeMirror from 'codemirror/lib/codemirror.js';
import 'codemirror/mode/javascript/javascript.js';

export default {
  props: {
    name: {
      type: String,
      default: 'code-editor'
    },
    dataSource: {
      type: [ String, Function ],
      required: true
    }
  },
  data() {
    return {};
  },
  computed: {
    currentValue() {
      return typeof this.dataSource === 'string' ? this.$store.getters[this.dataSource] : (this.dataSource instanceof Function ? this.data() : this.dataSource);
    }
  },
  methods: {
    getValue() {
      if (this.editor) {
        return this.editor.getValue();
      }
    },
    setValue(value) {
      if (this.editor) {
        return this.editor.setValue(value || '');
      }
    },
    parseValue() {
      return this.getValue();
    }
  },
  mounted() {
    this.editor = CodeMirror.fromTextArea(this.$el.querySelector('textarea'), {
      lineNumbers: true,
      cursorHeight: 0.9,
      mode: 'javascript'
    });
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.toTextArea();
    }
  },
  watch: {
    currentValue(value) {
      this.setValue(value);
    }
  }
};
</script>

<style lang="scss">
.code-editor {
  text-align: left;
  height: 100%;

  textarea {
    height: 100%;
  }
}
</style>
