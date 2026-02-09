import { createPeriod, getPeriods, updatePeriod, type GetPeriodsParams, type PeriodDto } from "@/api/generated";
import { ref } from "vue";


  const periods = ref<PeriodDto[]>([]);
  const loaded = ref<boolean>(false);

export function usePeriods() {

  const fetchPeriods = async(params : GetPeriodsParams) => {
    if (loaded.value) return;
    const response = getPeriods(params);
    response.then(r => {
      loaded.value = true;
      periods.value = r.data.content as PeriodDto[] || [];
    });
  }

  const addPeriod = (period : PeriodDto) => {
    return createPeriod(period);
  };

  const editPeriod = (id : number, period : PeriodDto) => {
    return updatePeriod(id, period);
  };

  return {periods, fetchPeriods, addPeriod, editPeriod}
}
