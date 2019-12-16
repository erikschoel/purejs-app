<template>
  <el-container>
    <el-header>{{ currentItemTitle }}</el-header>
    <el-container style="border: 1px solid #eee">
      <el-aside ref="sideBar" :data-source="'items/allItemsMap'" />
      <el-container>
        <el-header v-if="showHeader" style="text-align: right; font-size: 12px">
          <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 15px"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>View</el-dropdown-item>
              <el-dropdown-item>Add</el-dropdown-item>
              <el-dropdown-item>Delete</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span>Tom</span>
        </el-header>
        <el-main>
          <extend-builder v-if="currentNamespace === 'extended'" ref="extendBuilder" />
          <instance-builder v-else-if="currentNamespace === 'instances'" ref="instanceBuilder" />
          <code-editor ref="codeEditor" :data-source="'currentItem'" v-else />
        </el-main>
        <el-footer>
          <el-button v-if="hasCurrentItem" type="primary" @click="runItem">Run</el-button>
          <el-button v-if="hasCurrentItem" @click="clearItem">Clear</el-button>
          <el-button v-if="canEdit" @click="saveItem">Save</el-button>
          <el-button v-if="canEdit" @click="deleteItem">Delete</el-button>
        </el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import ElAside from 'components/Base/Aside';
import CodeEditor from 'components/Base/CodeEditor';
import ExtendBuilder from 'components/Content/ExtendBuilder';
import InstanceBuilder from 'components/Content/InstanceBuilder';
import { mapGetters } from 'vuex';
export default {
  props: {
    showHeader: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ElAside, CodeEditor, ExtendBuilder, InstanceBuilder
  },
  data() {
    return {
      refsMounted: false
    };
  },
  computed: {
    ...mapGetters([
      'currentItemRef'
    ]),
    ...mapGetters('items', [
      'currentItemTitle',
      'currentNamespace',
      'current',
      'currentItem',
      'currentItemName',
      'currentItemObject',
      'hasCurrentItem'
    ]),
    canEdit() {
      return this.hasCurrentItem && (this.currentItemRef[0] !== 'classes' && this.currentItemRef[0] !== 'utils');
    },
    currentItemParser() {
      return this.currentNamespace === 'extended' ? this.$refs.extendBuilder : this.$refs.codeEditor;
    },
    currentItemFunc() {
      return this.refsMounted && this.currentItemRef.length > 1 ? this.currentItem : this.$empty;
    },
    editorValue() {
      return this.currentItemFunc.$get(this.currentItemName);
    }
  },
  methods: {
    clearItem() {
      if (this.$refs.sideBar) {
        this.$refs.sideBar.deselectItem();
      }
    },
    parseItem(value) {
      if (value) {
        // eslint-disable-next-line
        const wrap = new Function('return ' + value + ';');
        return wrap();
      }
    },
    runItem() {
      if (this.hasCurrentItem) {
        const obj = this.currentItemObject;
        const name = this.currentItemName;

        if (obj && name && obj[name] instanceof Function && obj[name].length === 0) {
          const runnable = obj[name].call(obj['$pure'] && obj['$pure'] instanceof Function ? obj : this.$pure);
          if (this.currentNamespace === 'extend') {
            var ctor = this.parseItem(runnable.ctor);
            // eslint-disable-next-line
            var proto = (new Function([ '\treturn {' ].concat(runnable.proto.split('\n').map((line, index, all) => line === '}' && index < (all.length - 1) ? '},' : line).map(line => '\t\t' + line).concat([ '\t}' ])).join('\n')))();
            var klass = this.$pure.inherit(ctor, this.$pure.klass(runnable.base), proto, true);
            console.log(klass);
          } else if (runnable && runnable.run && runnable.run instanceof Function) {
            runnable.run();
          }
        }
      } else {
        const func = this.parseItem(this.currentItemParser.getValue());
        if (func && func instanceof Function) {
          func();
        }
      }
    },
    updateItem(remove, source) {
      const menu = this.currentItemRef[0];
      if (menu !== 'classes' && menu !== 'utils') {
        const func = this.parseItem(source.getValue());
        const name = func.name;

        if (func && func instanceof Function && name) {
          const idx = this.$pure[menu].indexOf(name);
          if (remove) {
            this.$pure[menu].splice(idx, 1);
            this.$store.commit('removeItem', { namespace: menu, key: name });
          } else {
            if (idx < 0) {
              this.$pure[menu].push(name);
              this.currentItemRef.push(name);
            }
            this.$store.commit('setItem', { namespace: menu, key: name, value: func });
          }

          return this.postToServer().then(() => {
            this.$refs.sideBar.selectCurrentItem();
            if (remove) {
              this.$refs.sideBar.resetActiveIndex();
            } else {
              this.$refs.sideBar.setActiveIndex(idx < 0);
            }
          });
        }
      }
    },
    saveItem() {
      return this.updateItem(false, this.currentItemParser);
    },
    deleteItem() {
      return this.updateItem(true);
    },
    async postToServer() {
      if (this.$refs.sideBar && !this.$refs.sideBar.isOpen) {
        this.$refs.sideBar.openMenu();
      }
      const data = [ 'tests', 'custom', 'extended', 'instances' ].reduce((result, namespace) => {
        result[namespace] = this.$pure.utils.keys(this.$pure[namespace]).reduce((acc, key) => {
          acc[key] = this.$pure.utils.toString(this.$store.getters['allItems'][namespace][key]);
          return acc;
        }, {});
        return result;
      }, {});

      return this.$store.dispatch('saveData', JSON.stringify(data));
    }
  },
  mounted() {
    this.refsMounted = true;
  },
  beforeDestroy() {
    this.refsMounted = false;
  },
  watch: {
    editorValue(value) {
      debugger;
      if (this.refsMounted && this.$refs.codeEditor) {
        this.$refs.codeEditor.setValue(value);
      }
    }
  }
};
</script>

<style lang="scss">
.el-container {
  height: 100%;
}
.el-header {
  background-color: #B3C0D1;
  color: #333;
  line-height: 60px;
  font-size: 24px;
  font-weight: bold;
}

.el-aside {
  width: 200px;
  color: #333;
  border-right: solid 1px #e6e6e6;

  .el-menu {
    border-right: none;
  }

  .el-submenu {
    .el-menu-item {
      height: 36px;
      line-height: 36px;
      font-size: 16px;
    }
    .el-submenu__title {
      font-size: 18px;
      font-weight: bold;
    }
    &.selected {
      background-color: #DDD;

      .el-submenu__title:hover {
        background-color: #BBB;
      }
    }
  }
  .el-menu-item-group__title {
    display: none;
  }
}

.el-main {
  padding: 0;

  .CodeMirror {
    height: 100%;
  }
}

.el-footer {
  display: flex;
  padding: 0 20px 0 50px;

  .el-button {
    flex: 1;
    max-height: 50px;
  }
}
</style>
