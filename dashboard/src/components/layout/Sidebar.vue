<template>
    <div class="h-screen w-64 bg-neumorph shadow-neumorph p-6">
        <div class="text-2xl font-bold mb-8 text-gray-800">Blog Dashboard</div>
        <nav>
            <ul class="space-y-4">
                <li>
                    <a href="#"
                        class="flex items-center p-3 rounded-lg hover:shadow-neumorph-inset transition-all duration-300 text-gray-700"
                        :class="{ 'shadow-neumorph-inset': currentRoute === 'dashboard' }"
                        @click="currentRoute = 'dashboard'">
                        <i class="pi pi-home mr-3"></i>
                        Dashboard
                    </a>
                </li>
                <li>
                    <a href="#"
                        class="flex items-center p-3 rounded-lg hover:shadow-neumorph-inset transition-all duration-300 text-gray-700"
                        :class="{ 'shadow-neumorph-inset': currentRoute === 'posts' }" @click="currentRoute = 'posts'">
                        <i class="pi pi-file mr-3"></i>
                        Posts
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentRoute = ref('dashboard')
</script>
