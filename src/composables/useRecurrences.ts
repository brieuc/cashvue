import { getRecurrences, createRecurrence, updateRecurrence, simulateEntries, type GetRecurrencesParams, type RecurrenceDto, type SimulateEntriesParams } from "@/api/generated";
import { ref } from "vue";

const recurrences = ref<RecurrenceDto[]>([]);
const loaded = ref<boolean>(false);

export function useRecurrences() {

  const fetchRecurrences = async (params?: GetRecurrencesParams) => {
    if (loaded.value) return;
    const response = await getRecurrences(params);
    if (response.status === 200) {
      recurrences.value = response.data.content as RecurrenceDto[] || [];
      loaded.value = true;
    }
  };

  const addRecurrence = (recurrence: RecurrenceDto) => {
    return createRecurrence(recurrence);
  };

  const editRecurrence = (id: number, recurrence: RecurrenceDto) => {
    return updateRecurrence(id, recurrence);
  };

  const simulate = (params: SimulateEntriesParams) => {
    return simulateEntries(params);
  };

  return { recurrences, fetchRecurrences, addRecurrence, editRecurrence, simulate };
}
