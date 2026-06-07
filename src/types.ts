/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CandidateProfile {
  name: string;
  education: string;
  graduationYear: string;
  targetRole: string;
  skills: string;
  projects: string;
  currentCity: string;
}

export type CompanyClass = 'MNC' | 'Startup' | 'Local' | 'All';

export interface CityHub {
  name: string;
  label: string;
  state: string;
  lat: number;
  lng: number;
}

export interface FresherRole {
  title: string;
  estimatedCTC: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  skillsNeeded: string;
}

export interface RecruiterPersona {
  name: string;
  title: string;
  email: string;
  linkedin: string;
  introText: string;
}

export interface InterviewProcess {
  assessmentRounds: string[];
  typicalQuestions: string[];
  prepTip: string;
}

export interface EnrichedCompanyInfo {
  companyType: string;
  indiaPresence: string;
  fresherRoles: FresherRole[];
  recruiters: RecruiterPersona[];
  interviewProcess: InterviewProcess;
}

export interface PlaceSuggestion {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  enriched?: EnrichedCompanyInfo;
  isLoadingEnrichment?: boolean;
}

export interface OutreachDraft {
  subjectLine?: string;
  messageBody: string;
  proTips: string[];
}

export interface SavedReachout {
  id: string;
  companyName: string;
  recruiterName: string;
  jobTitle: string;
  draftedMessage: string;
  subject?: string;
  timestamp: string;
}
