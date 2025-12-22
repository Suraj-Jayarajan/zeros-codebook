<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Blog Posts</h1> &lt;Button label="New Post" icon="pi pi-plus"
            @click="showDialog = true" class="p-button shadow-neumorph hover:shadow-neumorph-inset transition-all
            duration-300" /> &lt;/div> &lt;DataTable :value="posts" :paginator="true" :rows="5" class="shadow-neumorph
            p-4 rounded-lg" > &lt;Column field="title" header="Title"> &lt;template #body="slotProps"> &lt;span
            class="text-gray-700">{{ slotProps.data.title }}&lt;/span> &lt;/template> &lt;/Column> &lt;Column
            field="category" header="Category"> &lt;template #body="slotProps"> &lt;Tag :value="slotProps.data.category"
            :severity="getTagSeverity(slotProps.data.category)" /> &lt;/template> &lt;/Column> &lt;Column field="date"
            header="Date"> &lt;template #body="slotProps"> &lt;span class="text-gray-600">{{ slotProps.data.date
            }}&lt;/span> &lt;/template> &lt;/Column> &lt;Column header="Actions"> &lt;template #body="slotProps">
            &lt;div class="flex space-x-2"> &lt;Button icon="pi pi-pencil" @click="editPost(slotProps.data)"
            class="p-button-rounded p-button-text shadow-neumorph hover:shadow-neumorph-inset" /> &lt;Button icon="pi
            pi-trash" @click="confirmDelete(slotProps.data)" class="p-button-rounded p-button-danger p-button-text
            shadow-neumorph hover:shadow-neumorph-inset" /> &lt;/div> &lt;/template> &lt;/Column> &lt;/DataTable>
            &lt;Dialog v-model:visible="showDialog" :header="editMode ? 'Edit Post' : 'New Post'" modal class="w-1/2" >
            &lt;div class="space-y-4 p-4 bg-neumorph rounded-lg shadow-neumorph"> &lt;div> &lt;span
            class="p-float-label"> &lt;InputText id="title" v-model="post.title" class="w-full shadow-neumorph-inset" />
            &lt;label for="title">Title&lt;/label> &lt;/span> &lt;/div> &lt;div> &lt;span class="p-float-label">
            &lt;Dropdown id="category" v-model="post.category" :options="categories" class="w-full
            shadow-neumorph-inset" /> &lt;label for="category">Category&lt;/label> &lt;/span> &lt;/div> &lt;div>
            &lt;span class="p-float-label"> &lt;Textarea id="content" v-model="post.content" rows="5" class="w-full
            shadow-neumorph-inset" /> &lt;label for="content">Content&lt;/label> &lt;/span> &lt;/div> &lt;/div>
            &lt;template #footer> &lt;div class="flex justify-end space-x-2"> &lt;Button label="Cancel"
            @click="showDialog = false" class="p-button-text shadow-neumorph hover:shadow-neumorph-inset" /> &lt;Button
            :label="editMode ? 'Update' : 'Save'" @click="savePost" class="p-button-success shadow-neumorph
            hover:shadow-neumorph-inset" /> &lt;/div> &lt;/template> &lt;/Dialog> &lt;Dialog
            v-model:visible="deleteDialog" header="Confirm Delete" modal > &lt;div class="p-4 bg-neumorph rounded-lg
            shadow-neumorph"> &lt;p class="text-gray-700">Are you sure you want to delete this post?&lt;/p> &lt;/div>
            &lt;template #footer> &lt;div class="flex justify-end space-x-2"> &lt;Button label="No" @click="deleteDialog
            = false" class="p-button-text shadow-neumorph hover:shadow-neumorph-inset" /> &lt;Button label="Yes"
            @click="deletePost" class="p-button-danger shadow-neumorph hover:shadow-neumorph-inset" /> &lt;/div>
            &lt;/template> &lt;/Dialog> &lt;/div>&lt;/template>&lt;script setup lang="ts">import { ref, reactive } from
            'vue'import Button from 'primevue/button'import DataTable from 'primevue/datatable'import Column from
            'primevue/column'import Dialog from 'primevue/dialog'import InputText from 'primevue/inputtext'import
            Dropdown from 'primevue/dropdown'import Textarea from 'primevue/textarea'import Tag from 'primevue/tag'const
            showDialog = ref(false)const deleteDialog = ref(false)
            const editMode = ref(false)
            const posts = ref([
            { id: 1, title: 'Getting Started with Vue 3', category: 'Development', date: '2025-08-28', content: 'Content
            here...' },
            { id: 2, title: 'Neumorphic Design Trends', category: 'Design', date: '2025-08-27', content: 'Content
            here...' },
            ])

            const categories = ['Development', 'Design', 'Technology', 'Other']

            const post = reactive({
            id: null as number | null,
            title: '',
            category: '',
            content: '',
            })

            const postToDelete = ref(null)

            const getTagSeverity = (category: string) => {
            const severities: { [key: string]: string } = {
            Development: 'info',
            Design: 'success',
            Technology: 'warning',
            Other: 'secondary'
            }
            return severities[category] || 'info'
            }

            const editPost = (data: any) => {
            editMode.value = true
            Object.assign(post, data)
            showDialog.value = true
            }

            const confirmDelete = (data: any) => {
            postToDelete.value = data
            deleteDialog.value = true
            }

            const deletePost = () => {
            if (postToDelete.value) {
            posts.value = posts.value.filter(p => p.id !== postToDelete.value.id)
            deleteDialog.value = false
            postToDelete.value = null
            }
            }

            const savePost = () => {
            if (editMode.value) {
            const index = posts.value.findIndex(p => p.id === post.id)
            if (index !== -1) {
            posts.value[index] = { ...post }
            }
            } else {
            posts.value.push({
            ...post,
            id: posts.value.length + 1,
            date: new Date().toISOString().split('T')[0]
            })
            }
            showDialog.value = false
            resetForm()
            }

            const resetForm = () => {
            editMode.value = false
            Object.assign(post, {
            id: null,
            title: '',
            category: '',
            content: '',
            })
            }
            &lt;/script>
