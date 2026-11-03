export interface LegalSection {
  heading: string;
  paragraphs: string[];
  // Lista opcional que va después de los párrafos.
  items?: string[];
}

export interface LegalContent {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}
