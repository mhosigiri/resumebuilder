import { z } from 'zod';

export const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'] as const;
export const degreeTypes = ["Bachelor's", "Master's", 'PhD', 'Associate', 'Bootcamp', 'Certificate'] as const;
export const templateOptions = ['chronological', 'simple', 'professional'] as const;
export const relocationOptions = ['Yes', 'No', 'Open'] as const;
export const languageLevels = ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'] as const;
export const contributionTypes = ['Maintainer', 'Contributor'] as const;

export const resumeSectionKeys = [
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
] as const;

export type ResumeSectionKey = (typeof resumeSectionKeys)[number];

const resumeSectionKeyEnum = z.enum(resumeSectionKeys);

const personalInformationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional().default(''),
  preferredName: z.string().optional().default(''),
  email: z.string(),
  phoneNumber: z.string(),
  linkedinUrl: z.string().optional().default(''),
  githubUrl: z.string(),
  portfolioUrl: z.string().optional().default(''),
  location: z.string(),
  willingToRelocate: z.enum(relocationOptions).default('Open'),
});

const workExperienceSchema = z.object({
  id: z.string(),
  jobTitle: z.string(),
  companyName: z.string(),
  companyLocation: z.string().optional().default(''),
  employmentType: z.enum(employmentTypes),
  startDate: z.string(),
  endDate: z.string().optional().default(''),
  currentlyWorking: z.boolean().default(false),
  responsibilities: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});

const educationSchema = z.object({
  id: z.string(),
  degreeType: z.enum(degreeTypes),
  fieldOfStudy: z.string(),
  institutionName: z.string(),
  institutionLocation: z.string(),
  startDate: z.string(),
  graduationDate: z.string(),
  gpa: z.string().optional().default(''),
  coursework: z.string().optional().default(''),
  honors: z.string().optional().default(''),
});

const projectSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  description: z.string(),
  role: z.string(),
  technologies: z.array(z.string()).default([]),
  projectUrl: z.string().optional().default(''),
  githubRepo: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  achievements: z.array(z.string()).default([]),
});

const certificationSchema = z.object({
  id: z.string(),
  certificationName: z.string(),
  issuingOrganization: z.string(),
  issueDate: z.string(),
  expirationDate: z.string().optional().default(''),
  credentialId: z.string().optional().default(''),
  credentialUrl: z.string().optional().default(''),
});

const publicationSchema = z.object({
  id: z.string(),
  title: z.string(),
  coAuthors: z.string().optional().default(''),
  date: z.string().optional().default(''),
  publisher: z.string().optional().default(''),
  url: z.string().optional().default(''),
});

const openSourceSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  repoUrl: z.string(),
  contributionType: z.enum(contributionTypes),
  description: z.string(),
});

const awardSchema = z.object({
  id: z.string(),
  awardName: z.string(),
  organization: z.string(),
  date: z.string(),
  description: z.string(),
});

const languageSchema = z.object({
  id: z.string(),
  language: z.string(),
  proficiency: z.enum(languageLevels),
});

const volunteerSchema = z.object({
  id: z.string(),
  organization: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

const referenceContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  company: z.string(),
  email: z.string(),
  phone: z.string(),
});

const technicalSkillsSchema = z.object({
  programmingLanguages: z.array(z.string()).default([]),
  frameworksLibraries: z.array(z.string()).default([]),
  databases: z.array(z.string()).default([]),
  cloudPlatforms: z.array(z.string()).default([]),
  devOpsTools: z.array(z.string()).default([]),
  developmentTools: z.array(z.string()).default([]),
  methodologies: z.array(z.string()).default([]),
  otherSkills: z.array(z.string()).default([]),
});

const referencesSchema = z.object({
  availableUponRequest: z.boolean().default(true),
  contacts: z.array(referenceContactSchema).default([]),
});

const resumeSettingsSchema = z.object({
  template: z.enum(templateOptions).default('chronological'),
  colorScheme: z.enum(['#000000', '#111827', '#374151', '#4b5563']).default('#000000'),
  fontFamily: z.enum(['Arial', 'Times New Roman', 'Calibri']).default('Calibri'),
  sectionOrder: z.array(resumeSectionKeyEnum),
  sectionsVisibility: z.record(resumeSectionKeyEnum, z.boolean()),
});

export const resumeSchema = z.object({
  resumeId: z.string().optional(),
  resumeTitle: z.string(),
  targetRole: z.string().optional().default(''),
  targetCompany: z.string().optional().default(''),
  jobDescription: z.string().optional().default(''),
  tailoredResumeText: z.string().optional().default(''),
  personalInformation: personalInformationSchema,
  professionalSummary: z.string().default(''),
  workExperience: z.array(workExperienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  technicalSkills: technicalSkillsSchema,
  projects: z.array(projectSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  publications: z.array(publicationSchema).default([]),
  openSource: z.array(openSourceSchema).default([]),
  awards: z.array(awardSchema).default([]),
  languages: z.array(languageSchema).default([]),
  volunteerExperience: z.array(volunteerSchema).default([]),
  professionalMemberships: z.array(z.string()).default([]),
  references: referencesSchema,
  resumeSettings: resumeSettingsSchema,
});

export type ResumeData = z.infer<typeof resumeSchema>;

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
    sectionOrder: [...resumeSectionKeys],
    sectionsVisibility: resumeSectionKeys.reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<ResumeSectionKey, boolean>
    ),
  },
});

export const normalizeResume = (data?: Partial<ResumeData> | null): ResumeData => {
  const defaults = emptyResumeData();
  const merged: ResumeData = {
    ...defaults,
    ...data,
    personalInformation: {
      ...defaults.personalInformation,
      ...(data?.personalInformation ?? {}),
    },
    workExperience: Array.isArray(data?.workExperience) ? data!.workExperience : defaults.workExperience,
    education: Array.isArray(data?.education) ? data!.education : defaults.education,
    technicalSkills: {
      ...defaults.technicalSkills,
      ...(data?.technicalSkills ?? {}),
    },
    projects: Array.isArray(data?.projects) ? data!.projects : defaults.projects,
    certifications: Array.isArray(data?.certifications) ? data!.certifications : defaults.certifications,
    publications: Array.isArray(data?.publications) ? data!.publications : defaults.publications,
    openSource: Array.isArray(data?.openSource) ? data!.openSource : defaults.openSource,
    awards: Array.isArray(data?.awards) ? data!.awards : defaults.awards,
    languages: Array.isArray(data?.languages) ? data!.languages : defaults.languages,
    volunteerExperience: Array.isArray(data?.volunteerExperience)
      ? data!.volunteerExperience
      : defaults.volunteerExperience,
    professionalMemberships: Array.isArray(data?.professionalMemberships)
      ? data!.professionalMemberships
      : defaults.professionalMemberships,
    references: {
      ...defaults.references,
      ...(data?.references ?? {}),
      contacts: Array.isArray(data?.references?.contacts) ? data!.references!.contacts : defaults.references.contacts,
    },
    resumeSettings: {
      ...defaults.resumeSettings,
      ...(data?.resumeSettings ?? {}),
      sectionOrder: Array.isArray(data?.resumeSettings?.sectionOrder)
        ? (data!.resumeSettings!.sectionOrder as ResumeSectionKey[])
        : defaults.resumeSettings.sectionOrder,
      sectionsVisibility: {
        ...defaults.resumeSettings.sectionsVisibility,
        ...(data?.resumeSettings?.sectionsVisibility ?? {}),
      },
    },
  };

  return resumeSchema.parse(merged);
};


