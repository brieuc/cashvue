import { compute, type ComputationRequestDto, type ComputationResponseDto } from "@/api/generated"
import { ref } from "vue";

export function useComputation() {

  const computationResponse = ref<ComputationResponseDto>();

  const fetchComputation = async(computationRequest: ComputationRequestDto) => {

      compute(computationRequest).then(response => {
        if (response.status === 200) {
          computationResponse.value = response.data;
        }
      })
  }

  return { fetchComputation, computationResponse }
}
