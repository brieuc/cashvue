
import { getTags, type GetTagsParams } from "@/api/generated"
import { type TagDto } from "@/api/generated";
import { ref } from "vue";
export function useTags() {

  const tags = ref<TagDto[]>([]);
  const fetchTags = async (params : GetTagsParams) => {

    getTags(params).then(response => {
      if(response.status === 200) {
        tags.value = response.data.content as TagDto[] || [];
      }
    })
  }

  return {fetchTags, tags};
}
