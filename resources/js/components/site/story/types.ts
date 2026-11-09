export type StorySummary = {
    slug: string;
    desk: string;
    title: string;
    byline: string;
    minutes: number;
};

export type StoryBlock =
    | { type: 'p'; text: string }
    | { type: 'pullquote'; text: string }
    | {
          type: 'guide';
          title: string;
          rows: { term: string; meaning: string }[];
      };

export type StorySection = {
    id: string;
    name: string;
    blocks: StoryBlock[];
};

export type Story = StorySummary & {
    deck: string;
    sections: StorySection[];
    next: StorySummary;
};
