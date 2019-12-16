<template>
  <el-aside>
    <el-menu ref="mainMenu" :default-openeds="openMenus" @submenu-click="selectMenu">
      <el-submenu v-for="(menu, menuIndex) in currentValue" :index="'' + (menuIndex + 1)" :key="menuIndex" :class="{ selected: isActive(menuIndex) }">
        <template slot="title"><i class="el-icon-message"></i>{{ menu.title }}</template>
        <el-menu-item-group v-for="(group, groupIndex) in menu.groups" :key="'g-' + groupIndex">
          <el-menu-item v-for="(item, itemIndex) in group.items" :index="(menuIndex + 1) + '-' + (itemIndex + 1)" :key="'g-' + groupIndex + '-i-' + itemIndex" @click="selectItem(item)">{{ item.title }}</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
import Vue from 'vue';
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
      currentMenus: [],
      openMenus: []
    }
  },
  computed: {
    ...mapGetters([
      'currentItemRef'
    ]),
    currentValue() {
      return typeof this.dataSource === 'string' ? this.$store.getters[this.dataSource] : (this.dataSource instanceof Function ? this.data() : this.dataSource);
    },
    activeIndex() {
      return this.currentItemRef.length ? this.menus.indexOf(this.currentItemRef[0]) : -1;
    },
    isOpen() {
      const openMenus = this.$refs.mainMenu ? this.$refs.mainMenu.openedMenus : [];
      return openMenus.length > 0;
    }
  },
  methods: {
    isActive(menuIndex) {
      const openMenus = this.$refs.mainMenu.openedMenus;
      if (openMenus.length) {
        return openMenus[openMenus.length - 1] === ('' + (menuIndex + 1));
      } else {
        return this.menus.indexOf(this.currentItemRef[0]) === menuIndex;
      }
    },
    selectItem(item) {
      this.$store.commit('setCurrentItemRef', item.ref);
      this.$emit('item-click', item);
    },
    selectMenu(menu) {
      const key = menu.$vnode.data.key;
      const val = this.currentMenus[key];
      const opn = this.$refs.mainMenu.openedMenus;
      if (menu.opened) {
        const idx = opn.indexOf('' + key);
        if (idx >= 0 && opn.length > 1) this.$refs.mainMenu.openedMenus.splice(idx, 1);
      }
      this.$store.commit('setCurrentItemRef', [ val.title ]);
      this.$emit('menu-click', val.title);
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
      this.selectItem({ ref: this.currentItemRef.slice(0, 1).concat(this.currentItemRef.slice(-1)) });
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
  },
  watch: {
    activeMenus(menus) {
      if (this.currentMenus.length === 0 || this.currentMenus.reduce((acc, menu, index) => {
        return acc && JSON.stringify(menu) === JSON.stringify(menus[index]);
      }, true) === false) {
        menus.forEach((menu, index) => {
          Vue.set(this.currentMenus, index, menu);
        });
      }
    }
  }
};
</script>

<style lang="scss">
</style>
