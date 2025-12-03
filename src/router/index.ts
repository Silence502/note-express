import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    // history: createWebHistory(import.meta.env.BASE_URL),
    history: createWebHistory('index.html'),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/presentation/task/TaskView.vue')
        },
        {
            path: '/tags',
            name: 'tags',
            component: () => import('@/presentation/tag/TagView.vue')
        },
        {
            path: '/change-log',
            name: 'change-log',
            component: () => import('@/presentation/changeLog/ChangeLogView.vue')
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('@/presentation/settings/SettingsView.vue')
        }
    ],
})

export default router
