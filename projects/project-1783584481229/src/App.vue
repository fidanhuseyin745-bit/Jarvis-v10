<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
  <div style="padding: 30px;">
    <h1>Jarvis Vue</h1>
    <button @click="count++">Count {{ count }}</button>
  </div>
</template>
