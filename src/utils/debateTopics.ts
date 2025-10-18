export const randomDebateTopics = [
  "Artificial Intelligence will do more harm than good",
  "Social media has a net negative impact on society",
  "Remote work is better than office work",
  "Climate change is the most urgent global issue",
  "Universal basic income should be implemented worldwide",
  "Technology is making us less social",
  "Education should be completely free for everyone",
  "Space exploration is a waste of resources",
  "Cryptocurrency will replace traditional currency",
  "Genetic engineering of humans should be allowed",
  "Animal testing should be completely banned",
  "Governments should regulate social media platforms",
  "Nuclear energy is the solution to climate change",
  "Video games cause violent behavior",
  "Privacy is more important than security",
  "Automation will create more jobs than it destroys",
  "Traditional education is becoming obsolete",
  "Meat consumption should be banned",
  "Democracy is the best form of government",
  "Censorship is necessary in modern society"
];

export const getRandomTopic = () => {
  return randomDebateTopics[Math.floor(Math.random() * randomDebateTopics.length)];
};
