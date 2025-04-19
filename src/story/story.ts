import story from "./story.json";

export const getQuest = (day: number) => {
  const quests = story.filter((quest) => quest.day <= day);
  if (quests.length > 0) {
    return quests[quests.length - 1];
  }
  return story[0];
};
