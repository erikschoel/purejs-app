<template>
  <div class="instance-builder">
    <el-form ref="form" :model="form" label-width="30%">
      <el-form-item label="Base Class">
        <form-select :options="klassNames" :model="form.base" @change="(value) => form.base = value" />
      </el-form-item>
      <el-form-item label="Name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="Constructor">
        <code-editor ref="codeEditCtor" />
      </el-form-item>
      <el-form-item label="Prototype extend">
        <code-editor ref="codeEditProto" />
      </el-form-item>
      <el-form-item label="Instantiation">
        <code-editor ref="codeEditInst" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import FormSelect from 'components/Forms/Select';
import CodeEditor from 'components/Base/CodeEditor';
export default {
  components: {
    FormSelect, CodeEditor
  },
  data() {
    return {
      refsMounted: false,
      editors: [
        'codeEditCtor', 'codeEditProto', 'codeEditInst'
      ],
      form: {
        base: '',
        name: ''
      }
    }
  },
  computed: {
    klassNames() {
      return Object.keys(this.$pure.classes);
    },
    currentItemRef() {
      return this.$store.getters['currentItemRef'];
    },
    currentNamespace() {
      return this.currentItemRef.length ? this.currentItemRef[0] : '-';
    },
    current() {
      return this.currentItemRef[0] === 'classes' || this.currentItemRef[0] === 'utils' ? this.$pure.$get(this.currentItemRef.slice(0, -1).join('.')) : this.$store.getters['allItems'][this.currentItemRef[0]];
    },
    currentItem() {
      return this.currentItemRef.length ? this.current[this.currentItemName] : '';
    },
    currentItemName() {
      return this.currentItemRef.length > 1 ? this.currentItemRef.slice(-1).pop() : '';
    },
    editorValues() {
      const func = this.refsMounted && this.currentNamespace === 'extended' && this.currentItemRef.length > 1 ? this.currentItem : '';
      return func && func instanceof Function ? func() : {};
    }
  },
  methods: {
    getPropName(code) {
      return code.replace('codeEdit', '').toLowerCase();
    },
    getFormData() {
      return this.editors.reduce((acc, code) => {
        acc[this.getPropName(code)] = this.$refs[code].getValue();
        return acc;
      }, Object.assign({}, this.form));
    },
    getValue() {
      const form = this.getFormData();
      return [
        'function ' + form.name + '() {',
        ' return ' + JSON.stringify(form) + ';',
        '}'
      ].join('\n');
    },
    parseValue() {
      // eslint-disable-next-line
      var func = (new Function([ '\treturn {' ].concat(test.proto.split('\n').map((line, index, all) => line === '}' && index < (all.length - 1) ? '},' : line).map(line => '\t\t' + line).concat([ '\t}' ])).join('\n')));
      return func && func instanceof Function ? func() : {};
    }
  },
  mounted() {
    this.refsMounted = true;
  },
  beforeDestroy() {
    this.refsMounted = false;
  },
  watch: {
    editorValues(values) {
      values || (values = {});
      this.form.name = values.name || '';
      this.form.base = values.base || '';

      this.editors.forEach((code) => {
        if (this.$refs[code]) {
          this.$refs[code].setValue(values[this.getPropName(code)]);
        }
      });
    }
  }
};
</script>

<style lang="scss">
.instance-builder {
  width: 100%;
  padding: 20px;

  .el-form {
    width: 100%;

    .el-form-item {
      width: 100%;

      .el-form-item__label {
        text-align: left;
      }
      .el-select {
        width: 100%;
      }
      .code-editor {
        border: 1px solid #DCDFE6;
      }
    }
  }
}
</style>
