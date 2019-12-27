<template>
  <el-aside>
    <el-menu ref="mainMenu" :default-openeds="openMenus" @submenu-click="selectMenu">
      <el-submenu v-for="(menu, menuIndex) in menuListKeys" :index="'' + menuIndex" :key="menuIndex" :name="menu" :class="{ selected: isActive(menuIndex) }">
        <template slot="title"><i class="el-icon-message"></i>{{ menu }}</template>
        <el-menu-item-group :key="'g-' + menuIndex">
          <el-menu-item v-for="(item, itemIndex) in menuChildren(menu)" :index="menuIndex + '-' + itemIndex" :key="'g-0-i-' + itemIndex" @click="selectItem(menu, item)">{{ menuChild(menu, item) }}</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    dataSource: {
      type: [ String, Function ],
      required: true
    }
  },
  data() {
    return {
      menus: [ 'classes', 'utils' ],
      openMenus: []
    }
  },
  computed: {
    ...mapGetters([
      'allItems',
      'allItemsNamespaced',
      'currentItemRef'
    ]),
    ...mapGetters('items', [
      'currentItemId',
      'currentNamespace',
      'currentNamespaceItems'
    ]),
    currentValue() {
      return typeof this.dataSource === 'string' ? this.$store.getters[this.dataSource] : (this.dataSource instanceof Function ? this.data() : this.dataSource);
    },
    menuListKeys() {
      return [ 'classes', 'utils' ].concat(Object.keys(this.allItemsNamespaced));
    },
    activeIndex() {
      return this.currentItemRef.length ? this.menuListKeys.indexOf(this.currentItemRef[0]) : -1;
    },
    openedMenus() {
      return this.$refs.mainMenu ? this.$refs.mainMenu.openedMenus : [];
    },
    isOpen() {
      return this.openedMenus.length > 0;
    }
  },
  methods: {
    isActive(menuIndex) {
      const openMenus = this.openedMenus;
      if (openMenus.length) {
        return openMenus[openMenus.length - 1] === ('' + menuIndex);
      } else {
        return this.menus.indexOf(this.currentItemRef[0]) === menuIndex;
      }
    },
    menuChildren(namespace) {
      return namespace === 'classes' || namespace === 'utils' ? Object.keys(this.$pure[namespace]).sort() : this.allItemsNamespaced[namespace];
    },
    menuChild(namespace, item) {
      return namespace === 'classes' || namespace === 'utils' ? item : this.allItems[item].key;
    },
    selectItem(namespace, id) {
      this.$store.commit('setCurrentItemRef', [ namespace ]);
      const item = this.currentNamespaceItems[id];
      if (item) {
        this.$store.commit('addCurrentItemRef', id);
        this.$emit('item-click', id);
      }
    },
    selectMenu(menu) {
      const key = menu.$vnode.data.key;
      const opn = this.openedMenus;
      if (menu.opened) {
        const idx = opn.indexOf('' + key);
        if (idx >= 0 && opn.length > 1) this.$refs.mainMenu.openedMenus.splice(idx, 1);
      }
      this.$store.commit('setCurrentItemRef', [ menu.$attrs['name'] ]);
      this.$emit('menu-click', menu.$attrs['name']);
    },
    deselectItem() {
      this.$store.commit('resetCurrentItemRef');
      this.$refs.mainMenu.activeIndex = null;
    },
    setActiveIndex(isNew) {
      var items = this.$refs.mainMenu.$children[this.activeIndex].$children[0].$children;
      if (items.length && isNew) {
        this.$refs.mainMenu.activeIndex = items[items.length - 1].index;
      } else {
        this.$refs.mainMenu.activeIndex = items.filter(comp => comp.active).map(comp => comp.index).shift() || null;
      }
    },
    resetActiveIndex() {
      this.$refs.mainMenu.activeIndex = null;
    },
    selectCurrentItem() {
      this.selectItem(this.currentNamespace, this.currentItemId);
    },
    addMenu(name) {
      this.menus.push(name);
    },
    replaceMenu(name) {
      const ref = this.$refs.mainMenu;
      const opn = ref.openedMenus.slice(0);
      // const act = ref.activeIndex;
      const idx = this.menus.indexOf(name);
      if (idx < 0) {
        this.menus.push(name);
      } else {
        this.menus.splice(idx, 1);
        this.menus.splice(idx, 0, name);
      }
      setTimeout(() => {
        this.openMenus.splice(0);
        this.openMenus.push(...opn);
        ref.openedMenus.splice(0);
        ref.openedMenus.push(...opn);
        console.log(ref.openedMenus);
      }, 10);
    },
    refreshMenu() {
      this.menus.push('');
      this.menus.pop();
    },
    openMenu(index) {
      if (this.$refs.mainMenu) {
        this.$refs.mainMenu.openMenu('' + (index || (this.activeIndex + 1)));
      }
    },
    closeMenu(index) {
      if (this.$refs.mainMenu) {
        this.$refs.mainMenu.closeMenu(index || '1');
      }
    }
  },
  async created() {
    const data = await this.$store.dispatch('getData');
    this.menus.push(...Object.keys(data));
  }
};
</script>

<style lang="scss">
</style>
