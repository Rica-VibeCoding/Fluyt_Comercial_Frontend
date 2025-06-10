import * as React from "react"
import { SidebarContext as SidebarContextType } from "./types"

export const SidebarContext = React.createContext<SidebarContextType | null>(null)