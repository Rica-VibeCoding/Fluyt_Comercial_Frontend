'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useStepper } from '@/hooks/globais/use-stepper';

export function ProgressStepper() {
  const { 
    steps, 
    navigateToStep, 
    isStepClickable, 
    isStepCompleted, 
    isStepCurrent 
  } = useStepper();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = isStepCompleted(step.id);
            const isCurrent = isStepCurrent(step.id);
            const isClickable = isStepClickable(step.id);
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div 
                  className={`
                    flex items-center transition-all duration-200
                    ${isClickable 
                      ? 'cursor-pointer hover:scale-105' 
                      : 'cursor-not-allowed opacity-75'
                    }
                  `}
                  onClick={() => isClickable && navigateToStep(step.id)}
                  role="button"
                  tabIndex={isClickable ? 0 : -1}
                  aria-label={`Navegar para ${step.label}`}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      navigateToStep(step.id);
                    }
                  }}
                >
                  {/* Circle with icon */}
                  <div
                    className={`
                      relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${isCompleted 
                        ? 'bg-green-500 border-green-500 text-white shadow-md' 
                        : isCurrent 
                          ? 'bg-purple-600 border-purple-600 text-white shadow-lg' 
                          : 'bg-white border-gray-300 text-gray-400'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                    
                    {/* Active indicator */}
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-200 rounded-full animate-ping opacity-75" />
                    )}
                  </div>

                  {/* Label and description */}
                  <div className="ml-4 text-left">
                    <div
                      className={`
                        text-sm font-semibold transition-colors duration-300
                        ${isCurrent 
                          ? 'text-purple-700' 
                          : isCompleted 
                            ? 'text-green-700' 
                            : 'text-gray-500'
                        }
                      `}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-6">
                    <div
                      className={`
                        h-0.5 transition-colors duration-500
                        ${isCompleted || (isCurrent && index === steps.length - 2)
                          ? 'bg-green-500' 
                          : 'bg-gray-200'
                        }
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 