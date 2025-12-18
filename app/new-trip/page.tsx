"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Steps } from "primereact/steps";
import { useLogbookStore } from "../../lib/stores/logbook-store";
import {
  usePointsStore,
  type DistanceRule,
  type BonusRule,
} from "../../lib/stores/points-store";
import { type TripFormState, type TripSegment } from "./types";
import { BasicsStep } from "../../components/new-trip/BasicsStep";
import { SectionStep } from "../../components/new-trip/PointsStep";
import {
  ReviewStep,
  type PointsBreakdownItem,
} from "../../components/new-trip/ReviewStep";
import { TipsSidebar } from "../../components/new-trip/TipsSidebar";
import { StepFooter } from "../../components/new-trip/StepFooter";
import { NewTripHeader } from "../../components/new-trip/NewTripHeader";

const createId = (prefix: string) => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
};

const createInitialSegment = (
  rules: DistanceRule[],
  index = 0,
  crewMemberIds: string[] = []
): TripSegment => ({
  id: createId("segment"),
  name: `Abschnitt ${index + 1}`,
  distanceRuleId: rules[0]?.id ?? null,
  distanceKm: 0,
  bonuses: [],
  crewMemberIds,
});

export default function NewTripPage() {
  const router = useRouter();
  const { distanceRules, bonusRules } = usePointsStore((state) => ({
    distanceRules: state.distanceRules,
    bonusRules: state.bonusRules,
  }));
  const accounts = useLogbookStore((state) => state.accounts);
  const [formData, setFormData] = useState<TripFormState>(() => ({
    startTime: null,
    endTime: null,
    startLocation: "",
    endLocation: "",
    boat: null,
    crewMembers: [],
    lockCrewAcrossSegments: true,
    weather: null,
    notes: "",
    segments: [createInitialSegment(distanceRules, 0, [])],
    isTraining: false,
  }));
  const { trainingGroups } = useLogbookStore((state) => ({
    trainingGroups: state.trainingGroups,
  }));
  const [hasCustomEndLocation, setHasCustomEndLocation] = useState(false);

  const crewMembersKey = useMemo(
    () => formData.crewMembers.map((m) => m.uid).join("|"),
    [formData.crewMembers]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => {
      const crewIds = prev.crewMembers.map((member) => member.uid);
      const nextSegments = prev.segments.map((segment, index) => {
        const filteredIds = segment.crewMemberIds.filter((id) =>
          crewIds.includes(id)
        );
        const ids =
          prev.lockCrewAcrossSegments || index === 0
            ? crewIds
            : filteredIds;
        return { ...segment, crewMemberIds: ids };
      });
      const changed = prev.segments.some(
        (segment, idx) =>
          segment.crewMemberIds.join(",") !==
          nextSegments[idx].crewMemberIds.join(",")
      );
      if (!changed) {
        return prev;
      }
      return { ...prev, segments: nextSegments };
    });
  }, [crewMembersKey, formData.lockCrewAcrossSegments]);

  const [activeStep, setActiveStep] = useState(0);
  const [tipsVisible, setTipsVisible] = useState(false);

  const stepItems = useMemo(
    () => [{ label: "Basisdaten" }, { label: "Abschnitte" }, { label: "Review" }],
    []
  );

  const bonusRuleMap = useMemo(
    () => new Map(bonusRules.map((rule) => [rule.id, rule])),
    [bonusRules]
  );

  const pointsBreakdown = useMemo<PointsBreakdownItem[]>(() => {
    const breakdown: PointsBreakdownItem[] = [];

    distanceRules.forEach((rule: DistanceRule) => {
      const km = formData.segments
        .filter((segment) => segment.distanceRuleId === rule.id)
        .reduce((sum, segment) => sum + (segment.distanceKm || 0), 0);

      if (km > 0) {
        const points = Math.round(km * rule.pointsPerKm * 100) / 100;
        breakdown.push({
          id: `distance-${rule.id}`,
          label: rule.title,
          points,
          detail: `${km} km × ${rule.pointsPerKm} Punkte`,
        });
      }
    });

    const bonusValueTotals = new Map<BonusRule["id"], number>();
    formData.segments.forEach((segment) => {
      segment.bonuses.forEach((bonus) => {
        const rule = bonusRuleMap.get(bonus.ruleId);
        if (!rule) {
          return;
        }
        const prev = bonusValueTotals.get(bonus.ruleId) ?? 0;
        bonusValueTotals.set(bonus.ruleId, prev + (bonus.value ?? 0));
      });
    });

    bonusValueTotals.forEach((value, ruleId) => {
      if (value <= 0) {
        return;
      }
      const rule = bonusRuleMap.get(ruleId);
      if (!rule) {
        return;
      }
      if (typeof rule.points === "number") {
        const activations = value;
        const points = activations * rule.points;
        breakdown.push({
          id: `bonus-${rule.id}`,
          label: rule.title,
          points,
          detail:
            activations === 1
              ? "Einmal aktiviert"
              : `${activations}× aktiviert`,
        });
        return;
      }
      if (rule.points.perKm) {
        const points = Math.round(value * rule.points.perKm * 100) / 100;
        breakdown.push({
          id: `bonus-${rule.id}`,
          label: rule.title,
          points,
          detail: `${value} km × ${rule.points.perKm} Punkte`,
        });
        return;
      }
      if (rule.points.perOccurrence) {
        const points = value * rule.points.perOccurrence;
        breakdown.push({
          id: `bonus-${rule.id}`,
          label: rule.title,
          points,
          detail: `${value} ${rule.unitLabel} × ${rule.points.perOccurrence} Punkte`,
        });
      }
    });

    return breakdown;
  }, [bonusRuleMap, distanceRules, formData.segments]);


  const totalPoints = useMemo(
    () =>
      pointsBreakdown.reduce(
        (acc, item: PointsBreakdownItem) => acc + item.points,
        0
      ),
    [pointsBreakdown]
  );

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === stepItems.length - 1;

  const goToNextStep = () =>
    setActiveStep((prev) => Math.min(prev + 1, stepItems.length - 1));
  const goToPreviousStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = () => {
    // TODO: Wire up with backend store later
    router.push("/trips/TR-1094");
  };

  const handleStepSubmit = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      goToNextStep();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <NewTripHeader onOpenTips={() => setTipsVisible(true)} />

      <Card className="border-none bg-white shadow-sm">
        <Steps model={stepItems} activeIndex={activeStep} readOnly />
      </Card>

      {activeStep === 0 ? (
          <BasicsStep
            formData={formData}
            hasCustomEndLocation={hasCustomEndLocation}
            setHasCustomEndLocation={setHasCustomEndLocation}
            onFormDataChange={setFormData}
          />
      ) : null}

      {activeStep === 1 ? (
        <SectionStep
          formData={formData}
          setFormData={setFormData}
          distanceRules={distanceRules}
          bonusRules={bonusRules}
          crewMembers={formData.crewMembers}
          accounts={accounts}
          trainingGroups={trainingGroups}
        />
      ) : null}

      {activeStep === 2 ? (
        <ReviewStep
          formData={formData}
          pointsBreakdown={pointsBreakdown}
          totalPoints={totalPoints}
            distanceRules={distanceRules}
            bonusRules={bonusRules}
          />
      ) : null}

      <TipsSidebar visible={tipsVisible} onHide={() => setTipsVisible(false)} />

      <StepFooter
        activeStep={activeStep}
        stepCount={stepItems.length}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onPrevious={goToPreviousStep}
        onSubmitStep={handleStepSubmit}
      />
    </div>
  );
}
