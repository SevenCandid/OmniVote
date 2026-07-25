export enum CategoryType {
  POSITION = 'position',
  CATEGORY = 'category',
  PROPOSITION = 'proposition',
  QUESTION = 'question',
  CUSTOM = 'custom',
}

export enum VotingMethod {
  FIRST_PAST_THE_POST = 'first_past_the_post',
  RANKED_CHOICE = 'ranked_choice',
  APPROVAL = 'approval',
  SCORE = 'score',
  CUMULATIVE = 'cumulative',
}

export interface ElectionCategory {
  id: string;
  election_id: string;
  name: string;
  description: string | null;
  category_type: CategoryType;
  max_winners: number;
  voting_method: VotingMethod;
  display_order: number;
  created_at: string;
  updated_at: string | null;
}

export interface ElectionCategoryCreate {
  name: string;
  description?: string | null;
  category_type?: CategoryType;
  max_winners?: number;
  voting_method?: VotingMethod;
  display_order?: number;
}

export interface ElectionCategoryUpdate extends Partial<ElectionCategoryCreate> {}
