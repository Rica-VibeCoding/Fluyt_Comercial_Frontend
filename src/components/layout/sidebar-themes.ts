/**
 * Configuração de temas para a sidebar
 */

export interface SidebarTheme {
  name: string;
  id: string;
  colors: {
    primary: string;
    sidebar: string;
    sidebarForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
  };
}

export const sidebarThemes: SidebarTheme[] = [
  { 
    name: "Claro Padrão", 
    id: "light-default",
    colors: {
      primary: "210 100% 56%",
      sidebar: "0 0% 98%",
      sidebarForeground: "240 10% 3.9%",
      sidebarAccent: "240 4.8% 95.9%",
      sidebarAccentForeground: "240 5.9% 10%"
    }
  },
  { 
    name: "Azul Clarinho", 
    id: "blue-light",
    colors: {
      primary: "207 44% 49%",
      sidebar: "207 44% 49%",
      sidebarForeground: "0 0% 98%",
      sidebarAccent: "207 54% 39%",
      sidebarAccentForeground: "0 0% 98%"
    }
  },
  { 
    name: "Cinza Profissional", 
    id: "gray-professional",
    colors: {
      primary: "220 9% 46%",
      sidebar: "220 14% 96%",
      sidebarForeground: "220 9% 15%",
      sidebarAccent: "220 14% 90%",
      sidebarAccentForeground: "220 9% 15%"
    }
  },
  { 
    name: "Azul Corporativo", 
    id: "blue-corporate",
    colors: {
      primary: "210 100% 56%",
      sidebar: "210 20% 8%",
      sidebarForeground: "210 20% 98%",
      sidebarAccent: "210 50% 20%",
      sidebarAccentForeground: "210 20% 98%"
    }
  },
  { 
    name: "Verde Elegante", 
    id: "green-elegant",
    colors: {
      primary: "142 76% 36%",
      sidebar: "142 30% 12%",
      sidebarForeground: "142 15% 98%",
      sidebarAccent: "142 40% 22%",
      sidebarAccentForeground: "142 15% 98%"
    }
  },
  { 
    name: "Roxo Moderno", 
    id: "purple-modern",
    colors: {
      primary: "262 52% 47%",
      sidebar: "262 25% 15%",
      sidebarForeground: "262 15% 98%",
      sidebarAccent: "262 35% 25%",
      sidebarAccentForeground: "262 15% 98%"
    }
  },
  { 
    name: "Preto Minimalista", 
    id: "black-minimal",
    colors: {
      primary: "0 0% 7%",
      sidebar: "0 0% 7%",
      sidebarForeground: "0 0% 98%",
      sidebarAccent: "0 0% 17%",
      sidebarAccentForeground: "0 0% 98%"
    }
  }
];

export const defaultTheme = sidebarThemes[0];

export function applyTheme(themeId: string): void {
  const theme = sidebarThemes.find(t => t.id === themeId);
  if (!theme) return;

  const root = document.documentElement;
  
  // Aplicar CSS custom properties
  root.style.setProperty('--sidebar-primary', theme.colors.primary);
  root.style.setProperty('--sidebar-background', theme.colors.sidebar);
  root.style.setProperty('--sidebar-foreground', theme.colors.sidebarForeground);
  root.style.setProperty('--sidebar-accent', theme.colors.sidebarAccent);
  root.style.setProperty('--sidebar-accent-foreground', theme.colors.sidebarAccentForeground);
  
  // Salvar no localStorage
  localStorage.setItem('fluyt-sidebar-theme', themeId);
}

export function loadSavedTheme(): string {
  if (typeof window === 'undefined') return defaultTheme.id;
  
  const savedTheme = localStorage.getItem('fluyt-sidebar-theme');
  if (savedTheme && sidebarThemes.find(t => t.id === savedTheme)) {
    return savedTheme;
  }
  
  return defaultTheme.id;
}

export function getThemeById(themeId: string): SidebarTheme | undefined {
  return sidebarThemes.find(t => t.id === themeId);
} 