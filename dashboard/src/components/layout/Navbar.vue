<template>
    <nav class="w-full bg-neumorph shadow-neumorph p-4">
        <div class="flex justify-between items-center">
            <div class="text-xl font-semibold text-gray-800">Welcome to Blog Dashboard</div>
            <div class="flex items-center space-x-4">
                <Button type="button" icon="pi pi-user" class="p-button-rounded p-button-text"
                    :class="{ 'shadow-neumorph-inset': false }" severity="secondary" v-tooltip.bottom="'User Profile'" />
                <Button type="button" icon="pi pi-bell" class="p-button-rounded p-button-text"
                    :class="{ 'shadow-neumorph-inset': false }" severity="secondary" v-tooltip.bottom="'Notifications'"
                    badge="2" badge-class="bg-red-500" />
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
// Since we registered Button globally in main.ts, we don't need to import it here anymore
// Added some interactivity
const notifications = 2
</script>
