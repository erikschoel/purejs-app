<template>
  <el-container class="code-browser">
    <el-header>
      <span class="current-item-title">{{ currentItemTitle }}</span>
      <span class="current-function">{{ currentFunction }}</span>
    </el-header>
    <el-container class="content-container" style="border: 1px solid #eee">
      <el-aside ref="sideBar" :data-source="'allItemsNamespaced'" />
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
          <div class="empty-main" v-if="currentItemRef.length === 0"></div>
          <extend-builder v-else-if="currentNamespace === 'extended'" ref="extendBuilder" />
          <instance-builder v-else-if="currentNamespace === 'instances'" ref="instanceBuilder" />
          <code-editor ref="codeEditor" :data-source="'currentItem'" v-else />
        </el-main>
        <el-footer height="80">
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
      currentFunction: 'Code Browser',
      refsMounted: false,
      extended: 'extendBuilder',
      instances: 'instanceBuilder'
    };
  },
  computed: {
    ...mapGetters([
      'currentItemRef',
      'allItems',
      'allItemsNamespaced'
    ]),
    ...mapGetters('items', [
      'isInternal',
      'currentItemTitle',
      'currentNamespace',
      'current',
      'currentValue',
      'currentItem',
      'currentItemId',
      'currentItemName',
      'currentItemObject',
      'hasCurrentItem',
      'currentItems'
    ]),
    canEdit() {
      return this.hasCurrentItem && !this.isInternal;
    },
    currentItemParser() {
      return this[this.currentNamespace] ? this.$refs[this[this.currentNamespace]] : this.$refs.codeEditor;
    },
    editorValue() {
      return this.refsMounted && this.currentItemRef.length > 1 && this.currentValue;
    }
  },
  methods: {
    clearItem() {
      if (this.$refs.sideBar) {
        this.$refs.sideBar.deselectMenu();
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
      if (this.isInternal) {
        // SKIP
      } else if (this.hasCurrentItem && this.currentItemName) {
        const ns = this.$store.makeNamespace(this.currentNamespace).compile();
        if (ns) {
          ns.runItem(this.currentItemName);
        }
      } else {
        const func = this.parseItem(this.currentItemParser.getValue());
        if (func && func instanceof Function) {
          func();
        }
      }
    },
    updateItem(remove) {
      const menu = this.currentItemRef[0];
      if (menu !== 'classes' && menu !== 'utils') {
        const func = this.parseItem(this.currentItemParser.getValue());
        const name = func.name;

        if (func && func instanceof Function && name) {
          const isNew = !this.currentItemId;
          const id = this.currentItemId || this.$id();

          if (remove) {
            this.$store.commit('removeItem', { namespace: menu, id: id });
          } else {
            this.$store.commit('setItem', { id: id, key: name, namespace: menu, value: this.$pure.utils.toString(func) });

            if (isNew) {
              this.currentItemRef.push(id);
              this.$store.commit('addItemNamespaced', { namespace: menu, id: id });
            }
          }

          return this.postToServer().then(() => {
            this.$refs.sideBar.selectCurrentItem();
            if (remove) {
              this.$refs.sideBar.resetActiveIndex();
            } else {
              this.$refs.sideBar.setActiveIndex(isNew);
            }
          });
        }
      }
    },
    saveItem() {
      return this.updateItem(false);
    },
    deleteItem() {
      return this.updateItem(true);
    },
    async postToServer() {
      if (this.$refs.sideBar && !this.$refs.sideBar.isOpen) {
        this.$refs.sideBar.openMenu();
      }

      const data = Object.keys(this.allItemsNamespaced).reduce((result, namespace) => {
        result[namespace] = (this.allItemsNamespaced[namespace] || []).reduce((acc, id) => {
          const item = this.allItems[id];
          acc[item.key] = item;
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
      this.$nextTick(() => {
        if (this.refsMounted && this.$refs.codeEditor) {
          this.$refs.codeEditor.setValue(value);
        }
      });
    }
  }
};
</script>

<style lang="scss">
.code-browser {
  .el-container {
    height: 100%;

    &.content-container {
      height: calc(100% - 60px);

      .el-aside {
        height: 100%;
        overflow-y: auto;
      }
      .el-container {
        height: unset;
      }
    }
  }
  .el-header {
    background-color: #B3C0D1;
    color: #333;
    line-height: 60px;
    font-size: 24px;
    font-weight: bold;
  }

  .el-main {
    padding: 0;

    .empty-main {
      padding: 20px;

      table {
        width: 100%;
      }
    }

    .code-editor {
      border-bottom: 1px solid #e6e6e6;

      .CodeMirror {
        height: 100%;
      }
    }
  }

  .el-footer {
    display: flex;
    padding: 20px;

    .el-button {
      flex: 1;
      max-height: 50px;
    }
  }
}
</style>
