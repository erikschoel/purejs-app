<template>
  <el-select v-model="value" :placeholder="placeHolder">
    <el-option
      v-for="item in currentOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      default: () => []
    },
    placeHolder: {
      type: String,
      default: 'Select'
    },
    model: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      value: ''
    }
  },
  computed: {
    currentOptions() {
      return this.options.map((v) => {
        return typeof v === 'object' ? v : { value: v, label: v };
      });
    }
  },
  watch: {
    model(value) {
      if (value !== this.value) {
        this.value = value;
      }
    },
    value(value) {
      this.$emit('change', value);
    }
  }
}
</script>
