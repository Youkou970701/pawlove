export interface Pet {
  id: string;
  stage: 'egg' | 'puppy' | 'adult';
  name?: string;
  warmth: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  hatchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Couple {
  id: string;
  code: string;
  createdAt: string;
  pet?: Pet;
  dailyTasks?: { id: string; text: string; completed: boolean; reward: number }[];
}

export type PetStage = 'egg' | 'puppy' | 'adult';
export type InteractType = 'feed' | 'play' | 'clean' | 'sleep' | 'warmth';
