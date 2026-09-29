import { compute, computeTagAmounts, type ComputationRequestDto, type ComputationResponseDto, type TagAmountDto } from "@/api/generated"
import { ref } from "vue";

export function useComputation() {

  const computationResponse = ref<ComputationResponseDto>();
  const tagAmounts = ref<TagAmountDto[]>();

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
