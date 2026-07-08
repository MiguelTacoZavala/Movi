import { Check } from 'lucide-react'

export default function Stepper({ steps, currentStep, onStepClick }) {
  return (
    <div className="stepper" role="navigation" aria-label="Progreso de inscripción">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep
        const isActive = i === currentStep
        const isPending = i > currentStep
        return (
          <div
            key={i}
            className={`stepper-step${isCompleted ? ' completed' : ''}${isActive ? ' active' : ''}${isPending ? ' pending' : ''}`}
          >
            <button
              className="stepper-circle"
              onClick={() => isCompleted && onStepClick?.(i)}
              disabled={!isCompleted}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`${step.label}${isCompleted ? ' (completado)' : ''}${isActive ? ' (paso actual)' : ''}`}
              tabIndex={isPending ? -1 : 0}
            >
              {isCompleted ? <Check size={14} /> : <span>{i + 1}</span>}
            </button>
            <span className="stepper-label">{step.label}</span>
            <div className="stepper-line" />
          </div>
        )
      })}
    </div>
  )
}
