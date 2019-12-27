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
      default: null
    }
  },
  data() {
    return {
      value: ''
    };
  },
  computed: {
    currentValue() {
      return typeof this.dataSource === 'string' ? this.$store.getters[this.dataSource] : (this.dataSource instanceof Function ? this.dataSource() : this.dataSource);
    }
  },
  methods: {
    getValue() {
      if (this.editor) {
        return this.editor.getValue();
      }
    },
    setValue(value) {
      this.value = value;
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
    this.setValue(this.value);
  },
  beforeDestroy() {
    if (this.editor) {
      this.value = '';
      this.editor.toTextArea();
      this.editor = null;
    }
  },
  watch: {
    currentValue(value) {
      this.value = value;
    },
    value(value) {
      if (this.editor) {
        return this.editor.setValue(value || '');
      }
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
