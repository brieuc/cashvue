import { getTagGroups, getTitleSuggestions, type GetTagGroupsParams, type TagGroupDto, type TagGroupTitleSuggestionDto } from "@/api/generated"
import { ref } from "vue";



export function useTagGroups() {

  //const tagGroups = ref<TagGroupDto[]>([]);
  //const titleSuggestions = ref<TagGroupTitleSuggestionDto[]>([]);

  const fetchTagGroups = async (params: GetTagGroupsParams): Promise<TagGroupDto[]> => {
    const response = await getTagGroups(params);
    return response.status === 200 ? response.data : [];
  }

  const fetchTitleSuggestionsForTagGroup = async(tagGroupId : number) : Promise<TagGroupTitleSuggestionDto[]> => {
    return getTitleSuggestions(tagGroupId).then(response => {
      return response.status === 200 ? response.data : [];
    })
  }

  return { fetchTagGroups, fetchTitleSuggestionsForTagGroup }
}
