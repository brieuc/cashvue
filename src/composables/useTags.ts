
import { getTags, uploadIcon, type GetTagsParams, type UploadIconBody } from "@/api/generated"
import { type TagDto } from "@/api/generated";
import { ref } from "vue";

const tags = ref<TagDto[]>([]);
const loaded = ref<boolean>(false);
export function useTags() {


  const fetchTags = async (params : GetTagsParams) => {
    if (loaded.value === false)
      getTags(params).then(response => {
        if(response.status === 200) {
          tags.value = response.data.content as TagDto[] || [];
          loaded.value = true;
        }
      })
  }

  const uploadIconFile = async (tagId: number, uploadIconBody : UploadIconBody) => {
    const response = await uploadIcon(tagId, uploadIconBody);
    if (response.status === 200) {
        return response.data;
    }
  }

  return {fetchTags, tags, uploadIconFile};
}
