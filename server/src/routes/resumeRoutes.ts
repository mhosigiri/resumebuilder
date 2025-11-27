import { Router } from 'express';
import multer from 'multer';
import {
  callJobMatcherModel,
  callLayoutModel,
  callTextParser,
  callVisionParser,
} from '../services/openRouter';
import { ResumeData, normalizeResume, resumeSectionKeys, templateOptions } from '../utils/resumeSchema';
import { parseJsonFromModel } from '../utils/json';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const router = Router();

const allowedTemplates = templateOptions.join(' | ');
const allowedSections = resumeSectionKeys.join(', ');

const resumeSchemaPrompt = `
Return valid JSON that matches this shape:
{
  "resume": {
    "resumeTitle": string,
    "targetRole": string,
    "targetCompany": string,
    "jobDescription": string,
    "tailoredResumeText": string,
    "personalInformation": {
      "firstName": string,
      "lastName": string,
      "middleName": string,
      "preferredName": string,
      "email": string,
      "phoneNumber": string,
      "linkedinUrl": string,
      "githubUrl": string,
      "portfolioUrl": string,
      "location": string,
      "willingToRelocate": "Yes" | "No" | "Open"
    },
    "professionalSummary": string,
    "workExperience": WorkExperienceItem[],
    "education": EducationItem[],
    "technicalSkills": { all keys return string[] },
    "projects": ProjectItem[],
    "certifications": CertificationItem[],
    "publications": PublicationItem[],
    "openSource": OpenSourceItem[],
    "awards": AwardItem[],
    "languages": LanguageItem[],
    "volunteerExperience": VolunteerItem[],
    "professionalMemberships": string[],
    "references": {
      "availableUponRequest": boolean,
      "contacts": ReferenceContact[]
    },
    "resumeSettings": {
      "template": ${allowedTemplates},
      "colorScheme": "#000000" | "#111827" | "#374151" | "#4b5563",
      "fontFamily": "Arial" | "Times New Roman" | "Calibri",
      "sectionOrder": ResumeSectionKey[],
      "sectionsVisibility": Record<ResumeSectionKey, boolean>
    }
  }
}
Where ResumeSectionKey is one of: ${allowedSections}.
- Populate arrays even when empty.
- Responsibilities, achievements, and key features must be string arrays (each entry is a bullet).
- Dates must be "YYYY-MM" or "Present".
- Never invent experience; only reorganize what exists.
- Use sentence case text (no markdown, HTML, or LaTeX).`;

const buildVisionPrompt = () => {
  return `
${resumeSchemaPrompt}
Parse the attached resume (PDF or image) and fill the JSON. Follow reverse-chronological ordering by default and copy bullet language exactly as shown when possible.`;
};

const buildTextPrompt = (text: string) => {
  return `
${resumeSchemaPrompt}
Source resume text:
"""
${text}
"""
Normalize this resume into structured JSON.`;
};

const buildJobMatchPrompt = (jobDescription: string, resume: ResumeData) => {
  return `
${resumeSchemaPrompt}
Job description:
"""
${jobDescription}
"""
Existing resume JSON:
${JSON.stringify(resume)}

Objectives:
1. Identify skills, responsibilities, and achievements from the resume that align with the job.
2. Insert relevant keywords naturally without exaggerating experience.
3. Update professionalSummary, workExperience bullets, technicalSkills, and projects so they speak to the role.
4. Update resume.jobDescription with the provided posting.

Return JSON shaped as:
{
  "tailoredResumeText": "Plain text resume with headings and bullet symbols",
  "resume": ResumeData
}
`;
};

const buildLayoutPrompt = (template: string, resume: ResumeData) => {
  const templateGuidance: Record<TemplateOption, string> = {
    chronological:
      'Start with name + contact, then professional summary, work experience (reverse chronological), education, skills, then optional sections. Use bold headings and bullet points.',
    simple:
      'Use a single column minimalist layout. Headings should be uppercase text with blank line dividers. Avoid extra separators.',
    professional:
      'Use balanced spacing, subtle section dividers, and emphasize readability for executives.',
  };

  return `
${resumeSchemaPrompt}
Template requested: ${template.toUpperCase()}.
Guidance: ${templateGuidance[template as TemplateOption]}
Color palette must stay in grayscale (black/gray/white). Fonts limited to Arial, Times New Roman, or Calibri. No icons, tables, or colored elements.

Existing resume JSON:
${JSON.stringify(resume)}

Return JSON:
{
  "formattedText": "Plain text print-ready resume following the template instructions",
  "resume": ResumeData
}
`;
};

type TemplateOption = ResumeData['resumeSettings']['template'];

router.post('/parse-file', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'A resume file (PDF or image) is required.' });
  }
  try {
    const base64 = req.file.buffer.toString('base64');
    const aiRaw = await callVisionParser({
      prompt: buildVisionPrompt(),
      base64File: base64,
      mimeType: req.file.mimetype,
    });
    const parsed = parseJsonFromModel<{ resume: Partial<ResumeData> }>(aiRaw);
    const resume = normalizeResume(parsed.resume);
    res.json({ resume });
  } catch (error) {
    next(error);
  }
});

router.post('/parse-text', async (req, res, next) => {
  const { text } = req.body ?? {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ message: 'Resume text is required.' });
  }
  try {
    const aiRaw = await callTextParser(buildTextPrompt(text));
    const parsed = parseJsonFromModel<{ resume: Partial<ResumeData> }>(aiRaw);
    const resume = normalizeResume(parsed.resume);
    res.json({ resume });
  } catch (error) {
    next(error);
  }
});

router.post('/job-match', async (req, res, next) => {
  const { jobDescription, resume: incomingResume } = req.body ?? {};
  if (!jobDescription) {
    return res.status(400).json({ message: 'jobDescription is required.' });
  }
  try {
    const resume = normalizeResume(incomingResume);
    const aiRaw = await callJobMatcherModel(buildJobMatchPrompt(jobDescription, resume));
    const parsed = parseJsonFromModel<{
      tailoredResumeText: string;
      resume: Partial<ResumeData>;
    }>(aiRaw);
    const updatedResume = normalizeResume({
      ...resume,
      ...parsed.resume,
      jobDescription,
    });
    res.json({
      tailoredText: parsed.tailoredResumeText ?? '',
      updatedResume,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/generate-resume', async (req, res, next) => {
  const { resume: incomingResume, template } = req.body ?? {};
  if (!incomingResume) {
    return res.status(400).json({ message: 'resume payload is required.' });
  }
  try {
    const resume = normalizeResume(incomingResume);
    const selectedTemplate = (template ?? resume.resumeSettings.template) as TemplateOption;
    const aiRaw = await callLayoutModel(buildLayoutPrompt(selectedTemplate, resume));
    const parsed = parseJsonFromModel<{
      formattedText: string;
      resume: Partial<ResumeData>;
    }>(aiRaw);
    const updatedResume = normalizeResume({
      ...resume,
      ...parsed.resume,
      resumeSettings: {
        ...resume.resumeSettings,
        template: selectedTemplate,
      },
    });
    res.json({
      formattedText: parsed.formattedText ?? '',
      updatedResume,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


