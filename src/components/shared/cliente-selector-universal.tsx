"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useClientes } from "@/hooks/modulos/clientes/use-clientes"
import { useClienteSelecionado } from "@/hooks/globais/use-cliente-selecionado"

interface ClienteSelectorUniversalProps {
  targetRoute: string; // Rota de destino (ex: '/painel/ambientes', '/painel/contratos')
  placeholder?: string;
}

export function ClienteSelectorUniversal({ 
  targetRoute, 
  placeholder = "Selecionar cliente..." 
}: ClienteSelectorUniversalProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { clientes } = useClientes()
  const { clienteSelecionado } = useClienteSelecionado()

  const handleSelectCliente = (clienteId: string, clienteNome: string) => {
    setOpen(false)
    // Navega para a rota de destino com o cliente selecionado
    router.push(`${targetRoute}?clienteId=${clienteId}&clienteNome=${encodeURIComponent(clienteNome)}`)
  }

  // Se já tem cliente selecionado, mostra ele
  if (clienteSelecionado) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-3 w-full h-16 flex items-center">
        <div className="flex items-center gap-3 w-full">
          <div className="p-1.5 bg-primary rounded-lg">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground">
              Cliente Selecionado
            </p>
            <p className="text-lg font-bold text-foreground">
              {clienteSelecionado.nome}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Caso contrário, mostra o seletor
  return (
    <div className="bg-muted/50 border border-border rounded-lg p-3 w-full h-16 flex items-center">
      <div className="flex items-center gap-3 w-full">
        <div className="p-1.5 bg-primary rounded-lg">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            Selecione um cliente
          </p>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                aria-expanded={open}
                className="text-lg font-bold text-foreground p-0 h-auto justify-start hover:bg-transparent"
              >
                {placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar cliente..." />
                <CommandList>
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup>
                    {clientes.map((cliente) => (
                      <CommandItem
                        key={cliente.id}
                        value={cliente.nome}
                        onSelect={() => handleSelectCliente(cliente.id, cliente.nome)}
                      >
                        <Check className="mr-2 h-4 w-4 opacity-0" />
                        <div className="flex flex-col">
                          <span className="font-medium">{cliente.nome}</span>
                          <span className="text-xs text-muted-foreground">
                            {cliente.cpf_cnpj}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
} 