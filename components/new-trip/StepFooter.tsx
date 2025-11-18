"use client";

import { Button } from "primereact/button";

type StepFooterProps = {
  activeStep: number;
  stepCount: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrevious: () => void;
  onSubmitStep: () => void;
};

export const StepFooter = ({
  activeStep,
  stepCount,
  isFirstStep,
  isLastStep,
  onPrevious,
  onSubmitStep,
}: StepFooterProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="text-xs text-slate-500">
      Schritt {activeStep + 1} von {stepCount}
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        type="button"
        label="Zurück"
        icon="pi pi-arrow-left"
        className="rounded-full border-none bg-slate-200 px-5 py-3 text-slate-700 hover:bg-slate-300"
        disabled={isFirstStep}
        onClick={onPrevious}
      />
      <Button
        type="button"
        label={isLastStep ? "Speichern & Törn starten" : "Weiter"}
        icon={isLastStep ? "pi pi-save" : "pi pi-arrow-right"}
        iconPos={isLastStep ? "left" : "right"}
        className="rounded-full border-none bg-(--color-primary) px-5 py-3 font-semibold text-white hover:bg-(--color-primary-strong)"
        onClick={onSubmitStep}
      />
    </div>
  </div>
);
