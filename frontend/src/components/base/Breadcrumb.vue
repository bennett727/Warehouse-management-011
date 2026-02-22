<template>
  <div class="breadcrumb-container" v-if="breadcrumbs.length > 0">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path">
        <span v-if="item.icon" class="breadcrumb-icon">
          <el-icon><component :is="item.icon" /></el-icon>
        </span>
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title);
  const crumbs = matched.map((item) => ({
    path: item.path,
    title: item.meta.title,
    icon: item.meta.icon,
  }));

  if (route.meta.title) {
    const lastCrumb = crumbs[crumbs.length - 1];
    if (lastCrumb && lastCrumb.path !== route.path) {
      crumbs.push({
        path: route.path,
        title: route.meta.title,
        icon: route.meta.icon,
      });
    }
  }

  return crumbs;
});
</script>

<style scoped>
.breadcrumb-container {
  padding: 12px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.breadcrumb-icon {
  margin-right: 4px;
  vertical-align: middle;
}
</style>
