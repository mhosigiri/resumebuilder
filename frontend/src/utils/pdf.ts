import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ResumeData } from '../types/resume';

const fontMap: Record<ResumeData['resumeSettings']['fontFamily'], StandardFonts> = {
  Arial: StandardFonts.Helvetica,
  'Times New Roman': StandardFonts.TimesRoman,
  Calibri: StandardFonts.Helvetica,
};

const colorFromHex = (hex: string) => {
  const numeric = parseInt(hex.replace('#', ''), 16);
  return rgb(
    ((numeric >> 16) & 255) / 255,
    ((numeric >> 8) & 255) / 255,
    (numeric & 255) / 255
  );
};

export const buildResumePdf = async (resume: ResumeData) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { fontFamily, colorScheme } = resume.resumeSettings;
  const font = await pdfDoc.embedFont(fontMap[fontFamily]);
  const accent = colorFromHex(colorScheme);
  let cursorY = 750;

  const writeLine = (text: string, size = 11, bold = false) => {
    if (!text) return;
    page.drawText(text, {
      x: 50,
      y: cursorY,
      size,
      font,
      color: bold ? accent : rgb(0, 0, 0),
      maxWidth: 512,
    });
    cursorY -= size + 6;
  };

  const writeSection = (title: string, lines: string[]) => {
    if (lines.every((line) => !line)) return;
    writeLine(title.toUpperCase(), 12, true);
    lines.forEach((line) => writeLine(line));
    cursorY -= 6;
  };

  const { personalInformation } = resume;
  writeLine(
    `${personalInformation.firstName} ${personalInformation.lastName}`,
    18,
    true
  );
  writeLine(
    `${personalInformation.email} | ${personalInformation.phoneNumber} | ${personalInformation.location}`,
    10
  );
  writeLine(
    [personalInformation.linkedinUrl, personalInformation.githubUrl, personalInformation.portfolioUrl]
      .filter(Boolean)
      .join(' | '),
    10
  );
  cursorY -= 10;

  writeSection('Professional Summary', [resume.professionalSummary]);

  writeSection(
    'Work Experience',
    resume.workExperience.flatMap((role) => [
      `${role.jobTitle} • ${role.companyName} • ${role.companyLocation}`,
      `${role.startDate} — ${role.currentlyWorking ? 'Present' : role.endDate}`,
      ...role.responsibilities.map((item) => `• ${item}`),
      ...role.achievements.map((item) => `• ${item}`),
      `Technologies: ${role.technologies.join(', ')}`,
      '',
    ])
  );

  writeSection(
    'Education',
    resume.education.flatMap((item) => [
      `${item.degreeType} in ${item.fieldOfStudy}`,
      `${item.institutionName} • ${item.institutionLocation}`,
      `${item.startDate} — ${item.graduationDate}`,
      item.gpa ? `GPA: ${item.gpa}` : '',
      item.coursework ? `Relevant Coursework: ${item.coursework}` : '',
      item.honors ? `Honors: ${item.honors}` : '',
      '',
    ])
  );

  writeSection('Technical Skills', [
    `Languages: ${resume.technicalSkills.programmingLanguages.join(', ')}`,
    `Frameworks: ${resume.technicalSkills.frameworksLibraries.join(', ')}`,
    `Databases: ${resume.technicalSkills.databases.join(', ')}`,
    `Cloud: ${resume.technicalSkills.cloudPlatforms.join(', ')}`,
    `DevOps: ${resume.technicalSkills.devOpsTools.join(', ')}`,
    `Tools: ${resume.technicalSkills.developmentTools.join(', ')}`,
    `Methodologies: ${resume.technicalSkills.methodologies.join(', ')}`,
    `Other: ${resume.technicalSkills.otherSkills.join(', ')}`,
  ]);

  writeSection(
    'Projects',
    resume.projects.flatMap((project) => [
      `${project.projectName} • ${project.role}`,
      project.description,
      `Technologies: ${project.technologies.join(', ')}`,
      ...project.achievements.map((item) => `• ${item}`),
      project.projectUrl ? `Demo: ${project.projectUrl}` : '',
      project.githubRepo ? `Repo: ${project.githubRepo}` : '',
      '',
    ])
  );

  writeSection(
    'Certifications',
    resume.certifications.map(
      (cert) =>
        `${cert.certificationName} • ${cert.issuingOrganization} (${cert.issueDate}${
          cert.expirationDate ? ` - ${cert.expirationDate}` : ''
        })`
    )
  );

  writeSection(
    'Awards & Achievements',
    resume.awards.map(
      (award) => `${award.awardName} • ${award.organization} (${award.date}) — ${award.description}`
    )
  );

  writeSection(
    'Languages',
    resume.languages.map(
      (language) => `${language.language} — ${language.proficiency} proficiency`
    )
  );

  writeSection(
    'Volunteer Experience',
    resume.volunteerExperience.map(
      (item) =>
        `${item.organization}, ${item.role} (${item.startDate} - ${item.endDate}): ${item.description}`
    )
  );

  writeSection('Professional Memberships', resume.professionalMemberships);

  if (!resume.references.availableUponRequest) {
    writeSection(
      'References',
      resume.references.contacts.map(
        (contact) =>
          `${contact.name}, ${contact.title} at ${contact.company} (${contact.email} / ${contact.phone})`
      )
    );
  } else {
    writeSection('References', ['Available upon request.']);
  }

  const pdfBytes = await pdfDoc.save();
  const baseBuffer = pdfBytes.buffer;
  let arrayBuffer: ArrayBuffer;

  if (baseBuffer instanceof ArrayBuffer) {
    arrayBuffer = baseBuffer.slice(0);
  } else {
    const copy = new Uint8Array(pdfBytes);
    arrayBuffer = copy.buffer;
  }

  return new Blob([arrayBuffer], { type: 'application/pdf' });
};

