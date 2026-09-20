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
          // generated.ts types the response data as a single TagAmountDto,
          // but the back-end actually returns a List<TagAmountDto>
          tagAmounts.value = response.data as unknown as TagAmountDto[];
        }
      })
  }

  return { fetchComputation, computationResponse, fetchTagAmounts, tagAmounts }
}
