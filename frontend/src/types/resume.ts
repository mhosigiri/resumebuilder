export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Internship'
  | 'Freelance';

export type DegreeType =
  | "Bachelor's"
  | "Master's"
  | 'PhD'
  | "Associate"
  | 'Bootcamp'
  | 'Certificate';

export type TemplateOption = 'chronological' | 'simple' | 'professional';

export type ResumeSectionKey =
  | 'personalInformation'
  | 'professionalSummary'
  | 'workExperience'
  | 'education'
  | 'technicalSkills'
  | 'projects'
  | 'certifications'
  | 'publications'
  | 'openSource'
  | 'awards'
  | 'languages'
  | 'volunteerExperience'
  | 'professionalMemberships'
  | 'references';

export interface PersonalInformation {
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email: string;
  phoneNumber: string;
  linkedinUrl?: string;
  githubUrl: string;
  portfolioUrl?: string;
  location: string;
  willingToRelocate: 'Yes' | 'No' | 'Open';
}

export interface WorkExperienceItem {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLocation: string;
  employmentType: EmploymentType;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
}

export interface EducationItem {
  id: string;
  degreeType: DegreeType;
  fieldOfStudy: string;
  institutionName: string;
  institutionLocation: string;
  startDate: string;
  graduationDate: string;
  gpa?: string;
  coursework?: string;
  honors?: string;
}

export interface ProjectItem {
  id: string;
  projectName: string;
  description: string;
  role: string;
  technologies: string[];
  projectUrl?: string;
  githubRepo?: string;
  startDate?: string;
  endDate?: string;
  achievements: string[];
}

export interface CertificationItem {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  coAuthors?: string;
  date?: string;
  publisher?: string;
  url?: string;
}

export interface OpenSourceItem {
  id: string;
  projectName: string;
  repoUrl: string;
  contributionType: 'Maintainer' | 'Contributor';
  description: string;
}

export interface AwardItem {
  id: string;
  awardName: string;
  organization: string;
  date: string;
  description: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ReferenceContact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

export interface ResumeSettings {
  template: TemplateOption;
  colorScheme: '#000000' | '#111827' | '#374151' | '#4b5563';
  fontFamily: 'Arial' | 'Times New Roman' | 'Calibri';
  sectionOrder: ResumeSectionKey[];
  sectionsVisibility: Record<ResumeSectionKey, boolean>;
}

export interface TechnicalSkills {
  programmingLanguages: string[];
  frameworksLibraries: string[];
  databases: string[];
  cloudPlatforms: string[];
  devOpsTools: string[];
  developmentTools: string[];
  methodologies: string[];
  otherSkills: string[];
}

export interface ResumeData {
  resumeId?: string;
  resumeTitle: string;
  targetRole?: string;
  targetCompany?: string;
  jobDescription?: string;
  tailoredResumeText?: string;
  personalInformation: PersonalInformation;
  professionalSummary: string;
  workExperience: WorkExperienceItem[];
  education: EducationItem[];
  technicalSkills: TechnicalSkills;
  projects: ProjectItem[];
  certifications: CertificationItem[];
  publications: PublicationItem[];
  openSource: OpenSourceItem[];
  awards: AwardItem[];
  languages: LanguageItem[];
  volunteerExperience: VolunteerItem[];
  professionalMemberships: string[];
  references: {
    availableUponRequest: boolean;
    contacts: ReferenceContact[];
  };
  resumeSettings: ResumeSettings;
}

export const DEFAULT_SECTION_ORDER: ResumeSectionKey[] = [
  'personalInformation',
  'professionalSummary',
  'workExperience',
  'education',
  'technicalSkills',
  'projects',
  'certifications',
  'publications',
  'openSource',
  'awards',
  'languages',
  'volunteerExperience',
  'professionalMemberships',
  'references',
];

const defaultVisibility = DEFAULT_SECTION_ORDER.reduce(
  (acc, section) => ({ ...acc, [section]: true }),
  {} as Record<ResumeSectionKey, boolean>
);

export const emptyResumeData = (): ResumeData => ({
  resumeTitle: 'New Resume',
  targetRole: '',
  targetCompany: '',
  jobDescription: '',
  tailoredResumeText: '',
  personalInformation: {
    firstName: '',
    lastName: '',
    middleName: '',
    preferredName: '',
    email: '',
    phoneNumber: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    location: '',
    willingToRelocate: 'Open',
  },
  professionalSummary: '',
  workExperience: [],
  education: [],
  technicalSkills: {
    programmingLanguages: [],
    frameworksLibraries: [],
    databases: [],
    cloudPlatforms: [],
    devOpsTools: [],
    developmentTools: [],
    methodologies: [],
    otherSkills: [],
  },
  projects: [],
  certifications: [],
  publications: [],
  openSource: [],
  awards: [],
  languages: [],
  volunteerExperience: [],
  professionalMemberships: [],
  references: {
    availableUponRequest: true,
    contacts: [],
  },
  resumeSettings: {
    template: 'chronological',
    colorScheme: '#000000',
    fontFamily: 'Calibri',
    sectionOrder: DEFAULT_SECTION_ORDER,
    sectionsVisibility: defaultVisibility,
  },
});

export const professionalFonts: ResumeSettings['fontFamily'][] = [
  'Arial',
  'Times New Roman',
  'Calibri',
];

export const grayscalePalette: ResumeSettings['colorScheme'][] = [
  '#000000',
  '#111827',
  '#374151',
  '#4b5563',
];

