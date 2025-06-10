
import { useState, useEffect } from "react";
import { 
  Users, 
  Home, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Palette,
  Check
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
  },
  {
    title: "Ambientes",
    url: "/ambientes", 
    icon: Home,
  },
  {
    title: "Orçamentos",
    url: "/orcamentos",
    icon: FileText,
  },
  {
    title: "Contratos",
    url: "/contratos",
    icon: FileText,
  },
  {
    title: "Sistema",
    url: "/sistema",
    icon: Settings,
  },
];

const themes = [
  { 
    name: "Claro Moderno", 
    id: "light-modern",
    colors: {
      primary: "210 100% 56%",
      sidebar: "0 0% 98%",
      sidebarForeground: "240 10% 3.9%",
      sidebarAccent: "240 4.8% 95.9%",
      sidebarAccentForeground: "240 5.9% 10%"
    }
  },
  { 
    name: "Cinza Claro", 
    id: "light-gray",
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
    id: "corporate-blue",
    colors: {
      primary: "210 100% 56%",
      sidebar: "210 20% 8%",
      sidebarForeground: "210 20% 98%",
      sidebarAccent: "210 50% 20%",
      sidebarAccentForeground: "210 20% 98%"
    }
  },
  { 
    name: "Verde Profissional", 
    id: "professional-green",
    colors: {
      primary: "142 76% 36%",
      sidebar: "142 30% 12%",
      sidebarForeground: "142 15% 98%",
      sidebarAccent: "142 40% 22%",
      sidebarAccentForeground: "142 15% 98%"
    }
  },
  { 
    name: "Roxo Elegante", 
    id: "elegant-purple",
    colors: {
      primary: "262 52% 47%",
      sidebar: "262 25% 15%",
      sidebarForeground: "262 15% 98%",
      sidebarAccent: "262 35% 25%",
      sidebarAccentForeground: "262 15% 98%"
    }
  },
  { 
    name: "Marrom Terroso", 
    id: "earthy-brown",
    colors: {
      primary: "25 25% 52%",
      sidebar: "25 25% 52%",
      sidebarForeground: "0 0% 98%",
      sidebarAccent: "25 35% 42%",
      sidebarAccentForeground: "0 0% 98%"
    }
  },
  { 
    name: "Azul Noturno", 
    id: "night-blue",
    colors: {
      primary: "238 36% 22%",
      sidebar: "238 36% 22%",
      sidebarForeground: "0 0% 98%",
      sidebarAccent: "238 46% 32%",
      sidebarAccentForeground: "0 0% 98%"
    }
  },
  { 
    name: "Preto Profundo", 
    id: "deep-black",
    colors: {
      primary: "0 0% 7%",
      sidebar: "0 0% 7%",
      sidebarForeground: "0 0% 98%",
      sidebarAccent: "0 0% 17%",
      sidebarAccentForeground: "0 0% 98%"
    }
  },
  { 
    name: "Azul Aço", 
    id: "steel-blue",
    colors: {
      primary: "207 44% 49%",
      sidebar: "207 44% 49%",
      sidebarForeground: "0 0% 98%",
      sidebarAccent: "207 54% 39%",
      sidebarAccentForeground: "0 0% 98%"
    }
  },
  { 
    name: "Amarelo Dourado", 
    id: "golden-yellow",
    colors: {
      primary: "48 100% 63%",
      sidebar: "48 100% 63%",
      sidebarForeground: "240 10% 3.9%",
      sidebarAccent: "48 100% 53%",
      sidebarAccentForeground: "240 10% 3.9%"
    }
  },
];

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppSidebar({ isCollapsed = false, onToggleCollapse }: AppSidebarProps) {
  const [selectedTheme, setSelectedTheme] = useState("light-modern");
  const [isThemePopoverOpen, setIsThemePopoverOpen] = useState(false);

  const handleThemeChange = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    setSelectedTheme(themeId);
    
    // Aplicar as cores CSS customizadas
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--sidebar-background', theme.colors.sidebar);
    root.style.setProperty('--sidebar-foreground', theme.colors.sidebarForeground);
    root.style.setProperty('--sidebar-accent', theme.colors.sidebarAccent);
    root.style.setProperty('--sidebar-accent-foreground', theme.colors.sidebarAccentForeground);
    
    setIsThemePopoverOpen(false);
    
    // Salvar no localStorage
    localStorage.setItem('app-theme', themeId);
  };

  // Carregar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      handleThemeChange(savedTheme);
    }
  }, []);

  return (
    <Sidebar 
      className="border-r border-border/40" 
      collapsible="icon"
      style={{
        '--sidebar-width': '14rem',
        '--sidebar-width-icon': '4rem'
      } as React.CSSProperties}
    >
      <SidebarHeader className="border-b border-border/40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            <h1 className="text-lg font-bold text-sidebar-foreground mb-0.5">D-Art</h1>
            <p className="text-xs text-sidebar-foreground/70 font-medium">Fluyt</p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-7 w-7 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className="w-full h-9 px-2 rounded-lg hover:bg-sidebar-accent transition-all duration-200 group"
                  >
                    <a href={item.url} className="flex items-center">
                      <item.icon className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground transition-colors flex-shrink-0" />
                      <span className={`ml-2 text-sm font-medium text-sidebar-foreground group-hover:text-sidebar-accent-foreground transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 px-2 py-3 space-y-3">
        {/* Usuário */}
        <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="/placeholder.svg" alt="Usuário" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              JS
            </AvatarFallback>
          </Avatar>
          <div className={`ml-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            <p className="text-sm font-medium text-sidebar-foreground">João Silva</p>
            <p className="text-xs text-sidebar-foreground/70">Designer</p>
          </div>
        </div>

        {/* Paleta de cores */}
        <div className={`transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <Popover open={isThemePopoverOpen} onOpenChange={setIsThemePopoverOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1">
                <p className="text-sm font-medium mb-2">Escolher tema</p>
                {themes.map((theme) => (
                  <Button
                    key={theme.id}
                    variant="ghost"
                    className="w-full justify-start text-left h-9"
                    onClick={() => handleThemeChange(theme.id)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-3 border border-border flex-shrink-0"
                      style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                    />
                    <span className="text-sm">{theme.name}</span>
                    {selectedTheme === theme.id && (
                      <Check className="ml-auto h-3 w-3 flex-shrink-0" />
                    )}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
