export const LogicalNames = {
  SURVEY: "gyde_surveytemplate",
  CHAPTER: "gyde_surveytemplatechapter", 
  SECTION: "gyde_surveytemplatechaptersection",
  QUESTION: "gyde_surveytemplatechaptersectionquestion",
  ANSWER: "gyde_surveytemplatequestionanswer",
  GRID: "gyde_surveytemplatequestiongridcolumn",
};

export const NameMapper: {
  gyde_surveytemplatechapter: string,
  gyde_surveytemplatechaptersection: string,
} = {
  "gyde_surveytemplatechapter": "CHAPTER_HEADER",
  "gyde_surveytemplatechaptersection": "SECTION_HEADER",
}