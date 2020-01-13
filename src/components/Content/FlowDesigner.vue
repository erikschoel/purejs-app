<template>
  <el-container class="flow-designer">
    <el-header>
      <span class="current-item-title">{{ currentItemTitle }}</span>
      <span class="current-function">{{ currentFunction }}</span>
    </el-header>
    <el-container class="content-container" style="border: 1px solid #eee">
      <el-aside ref="sideBar" :data-source="'allItemsNamespaced'" />
      <el-container class="workspace">
        <div class="dropzone">
          <div v-for="(item, itemIndex) in activeItems" :key="itemIndex" :data-index="itemIndex" class="code-item" :style="{ top: item.top, left: item.left }">
            <i class="el-icon el-icon-circle-close" @click.stop="removeItem(itemIndex)"></i>
            {{ item.title }}
          </div>
        </div>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import ElAside from 'components/Base/Aside';
import { Droppable } from '@shopify/draggable';
import { mapGetters } from 'vuex';
import { getPosition, getTransformPosition } from 'helpers/dom';
export default {
  props: {
    showHeader: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ElAside, Droppable
  },
  data() {
    return {
      refsMounted: false,
      currentFunction: 'Flow Designer',
      items: []
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
    activeItems() {
      return this.items;
    }
  },
  methods: {
    getPosition(el) {
      return getPosition(el);
    },
    getTransformPosition(el) {
      return getTransformPosition(el);
    },
    createItem(item) {
      this.items.push(item);
    },
    moveItem(index, item) {
      if (this.items[index]) {
        let target = this.items[index];
        target.title = item.title;
        target.top = item.top;
        target.left = item.left;
      }
    },
    removeItem(index) {
      if (this.items[index]) {
        this.items.splice(index, 1);
      }
    },
    clearItem() {
      if (this.$refs.sideBar) {
        this.$refs.sideBar.deselectMenu();
      }
    },
    updateItem(remove) {
      return this.postToServer().then(() => {
        this.$refs.sideBar.selectCurrentItem();

        const isNew = false;

        if (remove) {
          this.$refs.sideBar.resetActiveIndex();
        } else {
          this.$refs.sideBar.setActiveIndex(isNew);
        }
      });
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
      // const data = {};
      // return this.$store.dispatch('saveData', JSON.stringify(data));
    },
    dragStart(evt) {
      // console.log.apply(console, [ 'drag:start' ].concat([].slice.call(arguments)));
    },
    dragMove() {
      // console.log.apply(console, [ 'drag:move' ].concat([].slice.call(arguments)));
    },
    dragStop(evt) {
      const posDrag = this.getTransformPosition(this.droppable.mirror);
      const posDrop = this.getPosition(this.$el.querySelector('.workspace'));

      const src = evt.originalSource;
      if (src.classList.contains('code-item')) {
        this.moveItem(src.getAttribute('data-index'), {
          title: evt.source.innerText,
          top: (posDrag.y - posDrop.y + 10) + 'px',
          left: (posDrag.x - posDrop.x + 20) + 'px'
        });
      } else {
        this.createItem({
          title: evt.source.innerText,
          top: (posDrag.y - posDrop.y + 10) + 'px',
          left: (posDrag.x - posDrop.x + 20) + 'px'
        });
      }
    },
    dropDone(evt) {
      // console.log.apply(console, [ 'drop:done', this.droppable.isDragging() ].concat([].slice.call(arguments)));
      evt.cancel();
    },
    dropCancel(evt) {
      // console.log.apply(console, [ 'drop:cancel', this.droppable.isDragging() ].concat([].slice.call(arguments)));
      evt.cancel();
    }
  },
  mounted() {
    this.refsMounted = true;

    this.droppable = new Droppable(document.querySelector('.content-container'), {
      draggable: 'li.el-menu-item, .code-item',
      dropzone: '.dropzone'
    });
    this.droppable.on('drag:start', this.dragStart);
    this.droppable.on('drag:move', this.dragMove);
    this.droppable.on('drag:stop', this.dragStop);

    this.droppable.on('droppable:dropped', this.dropDone);
    this.droppable.on('droppable:returned', this.dropCancel);
  },
  beforeDestroy() {
    this.refsMounted = false;
  },
  watch: {
    editorValue(value) {
      this.$nextTick(() => {
        if (this.refsMounted) {
          // this.$refs.codeEditor.setValue(value);
        }
      });
    }
  }
};
</script>

<style lang="scss">
.flow-designer {
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

        &.workspace {
          .dropzone {
            height: 100%;
            width: 100%;
            position: relative;

            .code-item {
              position: absolute;
              min-width: 100px;
              border: 1px solid red;
              text-align: center;
              padding: 10px;
            }
          }
        }
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
