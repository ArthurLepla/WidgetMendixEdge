import { useMemo } from "react";
import { ValueStatus, ListValue, ListAttributeValue } from "mendix";

export function useFeatureMap(
  featureList: ListValue | undefined,
  featureNameAttr: ListAttributeValue<string> | undefined
): Set<string> {
  return useMemo(() => {
    if (featureList?.status !== ValueStatus.Available || !featureNameAttr) {
      return new Set<string>();
    }
    return new Set<string>(
      (featureList.items ?? [])
        .map(item => featureNameAttr.get(item)?.value)
        .filter((value): value is string => !!value)
    );
  }, [featureList, featureNameAttr]);
}

export function useFeatureToggle(
  featureList: ListValue | undefined,
  featureNameAttr: ListAttributeValue<string> | undefined,
  featureName: string
): boolean {
  const featureMap = useFeatureMap(featureList, featureNameAttr);
  return featureMap.has(featureName);
}

export function useGranulariteManuelleToggle(
  featureList: ListValue | undefined,
  featureNameAttr: ListAttributeValue<string> | undefined
): boolean {
  return useFeatureToggle(featureList, featureNameAttr, "Granularite_Manuelle");
}

export function useDoubleIPEToggle(
  featureList: ListValue | undefined,
  featureNameAttr: ListAttributeValue<string> | undefined
): boolean {
  return useFeatureToggle(featureList, featureNameAttr, "Double_IPE");
}


