// @ts-ignore
import Aura from '@primeuix/themes/aura';
import {definePreset} from '@primeuix/themes';

export default definePreset(Aura, {
    semantic: {
        primary: {
            50: '#E3E8F6', /* purple-100 */
            100: '#CDD8F0', /* purple-200 */
            200: '#ABBDE5', /* purple-300 */
            300: '#839dd7', /* purple-400 */
            400: '#657dcc', /* purple-500 */
            500: '#5264be', /* purple-600 */
            600: '#434ea3', /* purple-700 */
            700: '#3f458e', /* purple-800 */
            800: '#363d72', /* purple-900 */
            900: '#252746' /* purple-1000 */
        },
        green: {
            100: '#DCFFF1', /* green-100 */
            200: '#BAF3DB', /* green-200 */
            300: '#7EE2B8', /* green-300 */
            400: '#4BCE97', /* green-400 */
            500: '#2ABB7F', /* green-500 */
            600: '#22A06B', /* green-600 */
            700: '#1F845A', /* green-700 */
            800: '#216E4E', /* green-800 */
            900: '#164B35', /* green-9000 */
            950: '#1C3329'  /* green-1000 */
        },
        red: {
            100: '#ffebec', /* red-100 */
            200: '#FFD5D2', /* red-200 */
            300: '#FD9891', /* red-300 */
            400: '#F87168', /* red-400 */
            500: '#F15B50', /* red-500 */
            600: '#E2483D', /* red-600 */
            700: '#C9372C', /* red-700 */
            800: '#AE2E24', /* red-800 */
            900: '#5D1F1A', /* red-9000 */
            950: '#42221F'  /* red-1000 */
        },
        orange: {
            100: '#fff2e6', /* orange-100 */
            200: '#ffd7b2', /* orange-200 */
            300: '#ffc48d', /* orange-300 */
            400: '#ffa959', /* orange-400 */
            500: '#ff9939', /* orange-500 */
            600: '#ff7f07', /* orange-600 */
            700: '#e87406', /* orange-700 */
            800: '#b55a05', /* orange-800 */
            900: '#8c4604', /* orange-9000 */
            950: '#6b3503'  /* orange-1000 */
        },
        yellow: {
            100: '#FFF7D6', /* yellow-100 */
            200: '#F8E6A0', /* yellow-200 */
            300: '#F5CD47', /* yellow-300 */
            400: '#E2B203', /* yellow-400 */
            500: '#CF9F02', /* yellow-500 */
            600: '#B38600', /* yellow-600 */
            700: '#946F00', /* yellow-700 */
            800: '#7F5F01', /* yellow-800 */
            900: '#533F04', /* yellow-9000 */
            950: '#332E1B'  /* yellow-1000 */
        },
        neutral: {
            50: '#ffffff', /* neutral-0 */
            100: '#F7F8F9', /* neutral-100 */
            200: '#ebedf0', /* neutral-200 */
            300: '#dfe2e6', /* neutral-300 */
            400: '#b3b9c4', /* neutral-400 */
            500: '#8993a4', /* neutral-500 */
            600: '#7a8699', /* neutral-600 */
            700: '#5d6b82', /* neutral-700 */
            800: '#42526d', /* neutral-800 */
            900: '#243757', /* neutral-9000 */
            950: '#15294b'  /* neutral-1000 */
        },
    },
    components: {
        menu: {
            css: () => `
                .p-menu {
                    .p-menu-item.danger {
                        & .p-menu-item-content {
                            color: var(--p-form-field-invalid-placeholder-color);
                            & .p-menu-item-icon {
                                color: var(--p-form-field-invalid-placeholder-color);
                            }
                            &:hover {
                            }
                        }
                    }
                }
                
                .p-menu.no-header {
                    #overlay_menu_0 {
                        display: none;
                    }
                }
            `
        },
        editor: {
            css: () => `
                .p-editor {
                    & .p-editor-content {
                         & .ql-editor {
                            background-color: var(--p-inputtext-background);
                         }
                    }
                }
            `
        },
        overlaybadge:{
            css: () => `
                .p-overlaybadge.filter-badge {
                    & .p-badge {
                        display: none;
                        margin-top: 4px;
                        margin-right: 4px;
                    }
                }
                .p-overlaybadge.show {
                    & .p-badge {
                        display: flex;
                    }
                }
            `
        },
        divider: {
            css: () => `
                .p-divider.divider-home {
                    & .p-divider-content {
                        background-color: var(--color-background-primary);
                    }
                }
            `
        },
        panel: {
            css: () => `
                .p-panel.docked {
                    max-width: calc(100% - 24px);
                    min-width: calc(100% - 24px);
                    
                    & .p-panel-content {
                        padding: 18px;
                    }
                    
                    & .p-panel-header {
                        display: none;
                    }
                }
            `
        },
        datatable: {
            css: () => `
                .p-datatable {
                    .p-datatable-table-container {
                        border: 1px solid var(--p-content-border-color);
                        border-radius: 6px;
                    }
                }
            `
        },
        dialog: {
            css: () => `
                .p-dialog {
                    width: calc(100% - 18px);
                }
            `
        },
        tag: {
            css: () => `
            .p-tag {
                .p-tag-label {
                    font-size: 12px;
                }
            }`
        },
        multiselect: {
            css: () => `
            .p-multiselect.filter {
                border: none;
                width: 35px;
                background-color: transparent;
                &:hover {
                    background-color: var(--p-button-text-secondary-hover-background);
                }
                & .p-multiselect-dropdown {
                    width: 100%;
                }
            }
            `
        },
        card: {
            css: () => `
                .p-card {
                    position: relative;
                    .p-card-body {
                        padding: 16px;
                        padding-top: 0;
                    }
                }
                .p-card.bordered {
                    border: 1px solid var(--p-content-border-color);
                }
                .p-card.bordered.priority {
                    border: 1px solid var(--color-background-danger-light);
                }
                .p-card.no-content {
                    .p-card-body {
                        gap: 2px;
                    }
                    .p-card-content {
                        display: none;
                    }
                    .p-card-body {
                    }
                }
                .p-card.is-done {
                    box-shadow: unset;
                    
                    & .p-card-body {
                        opacity: 0.7;
                    }
                }
            `
        }
    },
    extends: {}
})