import { getPeriods, type GetPeriodsParams, type PeriodDto } from "@/api/generated";
import { ref } from "vue";

export function usePeriods() {

  const periods = ref<PeriodDto[]>([]);

  const fetchPeriods = async(params : GetPeriodsParams) => {
    const response = getPeriods(params);
    response.then(r => {
      periods.value = r.data.content as PeriodDto[] || [];
    });
  }

  return {periods, fetchPeriods}

}
