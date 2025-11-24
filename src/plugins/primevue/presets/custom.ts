// @ts-ignore
import Aura from '@primeuix/themes/aura';
import {definePreset} from '@primeuix/themes';

export default definePreset(Aura, {
    semantic: {
        primary: {
            100: '#E3E8F6',
            200: '#CDD8F0',
            300: '#ABBDE5',
            400: '#839dd7',
            500: '#657dcc',
            600: '#5264be',
            700: '#434ea3',
            800: '#3f458e',
            900: '#363d72',
            1000: '#252746'
        },
        green: {
            100: '#DCFFF1',
            200: '#BAF3DB',
            300: '#7EE2B8',
            400: '#4BCE97',
            500: '#2ABB7F',
            600: '#22A06B',
            700: '#1F845A',
            800: '#216E4E',
            900: '#164B35',
            1000: '#1C3329'
        },
        red: {
            100: '#ffebec',
            200: '#FFD5D2',
            300: '#FD9891',
            400: '#F87168',
            500: '#F15B50',
            600: '#E2483D',
            700: '#C9372C',
            800: '#AE2E24',
            900: '#5D1F1A',
            1000: '#42221F'
        },
        orange: {
            100: '#fff2e6',
            200: '#ffd7b2',
            300: '#ffc48d',
            400: '#ffa959',
            500: '#ff9939',
            600: '#ff7f07',
            700: '#e87406',
            800: '#b55a05',
            900: '#8c4604',
            1000: '#6b3503'
        },
        yellow: {
            100: '#FFF7D6',
            200: '#F8E6A0',
            300: '#F5CD47',
            400: '#E2B203',
            500: '#CF9F02',
            600: '#B38600',
            700: '#946F00',
            800: '#7F5F01',
            900: '#533F04',
            1000: '#332E1B'
        },
        neutral: {
            0: '#ffffff',
            100: '#F7F8F9',
            200: '#ebedf0',
            300: '#dfe2e6',
            400: '#b3b9c4',
            500: '#8993a4',
            600: '#7a8699',
            700: '#5d6b82',
            800: '#42526d',
            900: '#243757',
            1000: '#15294b'
        },
    },
    components: {
        menu: {
            css: () => `
                .p-menu {
                    .p-menu-item.danger {
                        & .p-menu-item-content {
                            color: var(--p-form-field-invalid-placeholder-color);
                            
                            & .p-menu-item-link:hover {
                                color: var(--p-form-field-invalid-placeholder-color);
                            }
                            
                            & .p-menu-item-icon {
                                color: var(--p-form-field-invalid-placeholder-color);
                            }
                        }
                    }
                    
                    .p-menu-item:not(.danger) {
                        & .p-menu-item-link {
                            color: var(--color-content-primary);
                        }
                        
                        & .p-menu-item-icon {
                            color: var(--color-content-primary);
                        }
                        
                        & .p-menu-item-content:hover {
                            & .p-menu-item-link {
                                color: var(--color-content-primary);
                                
                                & .p-menu-item-icon {
                                    color: var(--color-content-primary);
                                }
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
                .p-editor.card-readonly {
                    .p-editor-toolbar {
                        padding: 8px 15px;
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
                        background-color: var(--color-background-secondary);
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
                    border: 1px solid var(--color-border-alert);
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