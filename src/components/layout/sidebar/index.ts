/**
 * Exports da sidebar refatorada
 */

export { Sidebar } from './core/sidebar';
export { SidebarProvider, useSidebar } from './core/sidebar-context';
export { SidebarMenu } from './components/sidebar-menu';
export { SidebarHeader } from './components/sidebar-header';
export { SidebarFooter } from './components/sidebar-footer';
export { SidebarUser } from './components/sidebar-user';
export { ThemeSelector } from './themes/theme-selector';
export { ThemeProvider } from './themes/theme-provider';
export { menuItems, type MenuItem } from './config/menu-config';
export type { SidebarContextType, UserInfo } from './core/sidebar-types'; 