import { compute, computeTagAmounts, type ComputationRequestDto, type ComputationResponseDto, type TagsAmountDto } from "@/api/generated"
import { ref } from "vue";

export function useComputation() {

  const computationResponse = ref<ComputationResponseDto>();
  const tagAmounts = ref<TagsAmountDto[]>();

  const fetchComputation = async(computationRequest: ComputationRequestDto) => {

      compute(computationRequest).then(response => {
        if (response.status === 200) {
          computationResponse.value = response.data;
        }
      })
  }

  const fetchTagAmounts = async(computationRequest: ComputationRequestDto) => {

      computeTagAmounts(computationRequest).then(response => {
        if (response.status === 200) {
          tagAmounts.value = response.data;
        }
      })
  }

  return { fetchComputation, computationResponse, fetchTagAmounts, tagAmounts }
}
