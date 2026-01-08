
import { getTags, type GetTagsParams } from "@/api/generated"
import { type TagDto } from "@/api/generated";
import { ref } from "vue";
export function useTags() {

  const tags = ref<TagDto[]>([]);
  const fetchTags = async (params? : GetTagsParams) => {

    getTags().then(response => {
      if(response.status === 200) {
        tags.value = response.data.content as TagDto[] || [];
        console.log("tags " + JSON.stringify(tags.value));
      }
    })
  }

  return {fetchTags, tags};
}
