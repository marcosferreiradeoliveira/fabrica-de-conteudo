
export interface PlatformConfig {
  tone: string;
  format: string;
  styleReferences: string;
  campaignGoal: string;
  // Specific fields
  hashtags?: string;
  cta?: string;
  subjectLine?: string;
  hook?: string;
  scriptStructure?: string;
}

export interface Product {
  id: string;
  name: string;
  productContext: string;
  targetAudience: string;
  usp: string;
  painPoints: string;
  restrictions: string;
  contentPillar: string;
  
  ebook: PlatformConfig;
  podcast: PlatformConfig;
  video: PlatformConfig;
  instagram: PlatformConfig;
  linkedin: PlatformConfig;
  email: PlatformConfig;
}

export type ContentConfig = Product;

export interface ContentPackage {
  ebookResearch: string;
  podcastScript: {
    title: string;
    introduction: string;
    segments: Array<{ title: string; notes: string }>;
    conclusion: string;
  };
  videoScriptJson: string; // JSON string for AI generation
  socialMedia: {
    instagram: string;
    linkedin: string;
  };
  emailMarketing: string;
}

export interface GenerationState {
  loading: boolean;
  error: string | null;
  content: ContentPackage | null;
}
