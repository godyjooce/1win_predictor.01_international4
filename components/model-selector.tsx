'use client'

import { Model } from '@/lib/types/models'
import { getCookie, setCookie } from '@/lib/utils/cookies'
import {
  BrainCircuit, // Иконка для 'reasoning'
  Building2, // Общая иконка для провайдера
  Check,
  ChevronsUpDown,
  Flame, // Иконка для 'popular'
  LucideProps,
  Zap // Иконка для 'fast'
} from 'lucide-react'
import Image from 'next/image'
import {
  ForwardRefExoticComponent,
  RefAttributes,
  useEffect,
  useState
} from 'react'
import { createModelId } from '../lib/utils'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip'
import { cn } from '@/lib/utils'

// Определяем тип иконки Lucide более точно
type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>

// Определяем тип для тегов для ясности
type ModelTag = 'popular' | 'fast' | 'reasoning'

// --- Расширенный интерфейс Model (пример) ---
interface ExtendedModel extends Model {
  description?: string
  tags?: ModelTag[] // Используем определенный тип
  performance?: {
    accuracy?: string
    speed?: string
    cost?: string
  }
}
// --- Конец примера расширенного интерфейса ---

function groupModelsByProvider(models: ExtendedModel[]) {
  return models
    .filter(model => model.enabled)
    .reduce(
      (groups, model) => {
        const provider = model.provider
        if (!groups[provider]) {
          groups[provider] = []
        }
        groups[provider].push(model)
        return groups
      },
      {} as Record<string, ExtendedModel[]>
    )
}

// --- Функция для получения иконки провайдера (пример) ---
const getProviderIconComponent = (providerId: string): LucideIcon => {
  // Ваша логика сопоставления providerId с иконками
  return Building2 // Иконка по умолчанию
}
// --- Конец примера функции ---

// Функция для получения иконки по тегу
const getTagIcon = (tag: string): LucideIcon | null => {
  switch (tag) {
    case 'popular':
      return Flame
    case 'fast':
      return Zap
    case 'reasoning':
      return BrainCircuit
    default:
      return null
  }
}

interface ModelSelectorProps {
  models: ExtendedModel[]
}

export function ModelSelector({ models }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => {
    const savedModel = getCookie('selectedModel')
    if (savedModel) {
      try {
        const model = JSON.parse(savedModel) as Partial<ExtendedModel>
        if (model.id && model.providerId) {
          setValue(createModelId(model as ExtendedModel))
        } else {
          console.warn('Saved model data is insufficient:', model)
          setCookie('selectedModel', '')
        }
      } catch (e) {
        console.error('Failed to parse saved model:', e)
        setCookie('selectedModel', '')
      }
    }
  }, [])

  const handleModelSelect = (id: string) => {
    const newValue = id === value ? '' : id
    setValue(newValue)

    const selectedModelData = models.find(
      model => createModelId(model) === newValue
    )
    if (selectedModelData) {
      const modelToSave: Partial<ExtendedModel> = {
        id: selectedModelData.id,
        name: selectedModelData.name,
        provider: selectedModelData.provider,
        providerId: selectedModelData.providerId,
        tags: selectedModelData.tags
      }
      setCookie('selectedModel', JSON.stringify(modelToSave))
    } else {
      setCookie('selectedModel', '')
    }

    setOpen(false)
  }

  const selectedModel = models.find(model => createModelId(model) === value)
  const groupedModels = groupModelsByProvider(models)

  return (
    <TooltipProvider delayDuration={300}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-auto rounded-full text-sm shadow-none transition-colors duration-200 ease-in-out focus:ring-0',
              selectedModel
                ? 'border-primary bg-primary/10 hover:bg-primary/15'
                : 'hover:bg-accent/50'
            )}
          >
            {selectedModel ? (
              <div className="flex items-center space-x-1.5 py-0.5">
                <Image
                  src={`/providers/logos/${selectedModel.providerId}.svg`}
                  alt={selectedModel.provider}
                  width={20}
                  height={20}
                  // <<< ИЗМЕНЕНИЕ ЗДЕСЬ: Заменен bg-background на bg-white >>>
                  // Это гарантирует светлый фон под логотипом в любой теме.
                  // Примечание: Идеальное решение - изменить SVG файлы, чтобы они использовали `currentColor` для заливки/обводки,
                  // тогда они будут адаптироваться к цвету текста темы автоматически.
                  className="rounded-full border border-border/50 bg-white p-0.5 shadow-sm"
                />
                <span className="text-xs font-medium">{selectedModel.name}</span>
                {selectedModel.tags?.map(tag => {
                  const Icon = getTagIcon(tag)
                  return Icon ? (
                    <Tooltip key={tag}>
                      <TooltipTrigger asChild>
                        <Icon
                          size={13}
                          className={cn(
                            'ml-0.5 flex-shrink-0',
                            tag === 'popular' && 'text-orange-500',
                            tag === 'fast' && 'text-blue-500',
                            tag === 'reasoning' && 'text-purple-500'
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="capitalize">{tag}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : null
                })}
              </div>
            ) : (
              'Select model'
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList>
              <CommandEmpty>No model found.</CommandEmpty>
              {Object.entries(groupedModels).map(
                ([provider, providerModels]) => {
                  const ProviderIcon = getProviderIconComponent(
                    providerModels[0].providerId
                  )
                  return (
                    <CommandGroup
                      key={provider}
                      heading={
                        <div className="flex items-center px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          <ProviderIcon
                            size={14}
                            className="mr-1.5 flex-shrink-0"
                          />
                          {provider}
                        </div>
                      }
                    >
                      {providerModels.map(model => {
                        const modelId = createModelId(model)
                        const isSelected = value === modelId
                        // Фильтруем и уточняем тип tagIcons
                        const tagIcons = (model.tags ?? [])
                          .map(tag => ({ tag, Icon: getTagIcon(tag) }))
                          .filter(
                            (item): item is { tag: ModelTag; Icon: LucideIcon } =>
                              item.Icon !== null
                          )

                        return (
                          <Tooltip key={modelId}>
                            <TooltipTrigger asChild>
                              <CommandItem
                                value={modelId}
                                onSelect={handleModelSelect}
                                className={cn(
                                  'flex cursor-pointer items-start justify-between space-x-2 p-2',
                                  isSelected && 'bg-accent text-accent-foreground'
                                )}
                              >
                                <div className="flex items-start space-x-2">
                                  <Image
                                    src={`/providers/logos/${model.providerId}.svg`}
                                    alt={model.provider}
                                    width={24}
                                    height={24}
                                    // <<< ИЗМЕНЕНИЕ ЗДЕСЬ: Заменен bg-background на bg-white >>>
                                    // Гарантирует светлый фон под логотипом в любой теме.
                                    className="mt-0.5 rounded-full border border-border/50 bg-white p-0.5 shadow-sm"
                                  />
                                  <div className="flex flex-col">
                                    <div className="flex items-center space-x-1">
                                      <span className="text-xs font-medium">
                                        {model.name}
                                      </span>
                                      {/* Иконки тегов */}
                                      {tagIcons.map(({ tag, Icon }) => (
                                        <Icon
                                          key={tag}
                                          size={13}
                                          className={cn(
                                            'flex-shrink-0',
                                            tag === 'popular' && 'text-orange-500',
                                            tag === 'fast' && 'text-blue-500',
                                            tag === 'reasoning' &&
                                              'text-purple-500',
                                            !isSelected && 'opacity-70'
                                          )}
                                          aria-label={tag}
                                        />
                                      ))}
                                    </div>
                                    {/* Характеристики моделей */}
                                    {model.performance && (
                                      <div className="mt-0.5 space-x-1.5 text-xs text-muted-foreground/80">
                                        {model.performance.accuracy && (
                                          <span>
                                            Acc: {model.performance.accuracy}
                                          </span>
                                        )}
                                        {model.performance.speed && (
                                          <span>
                                            Spd: {model.performance.speed}
                                          </span>
                                        )}
                                        {model.performance.cost && (
                                          <span>Cost: {model.performance.cost}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Check
                                  className={cn(
                                    'mt-0.5 h-4 w-4 flex-shrink-0',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            </TooltipTrigger>
                            {model.description && (
                              <TooltipContent side="right" align="start">
                                <p className="max-w-[200px] text-xs">
                                  {model.description}
                                </p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        )
                      })}
                    </CommandGroup>
                  )
                }
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}
