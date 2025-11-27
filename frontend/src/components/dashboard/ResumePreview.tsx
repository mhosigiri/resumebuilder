import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import type { ResumeData, ResumeSectionKey } from '../../types/resume';
import { generateResumeLayout } from '../../services/api';
import { buildResumePdf } from '../../utils/pdf';
import { grayscalePalette } from '../../types/resume';

interface Props {
  resume: ResumeData;
  onUpdateResume?: (resume: ResumeData) => void;
  selectedResumeId?: string | null;
  saveResume?: (data: ResumeData) => Promise<void>;
}

const SectionHeading = ({ title }: { title: string }) => (
  <Typography
    variant="subtitle1"
    fontWeight={700}
    sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
  >
    {title}
  </Typography>
);

const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
  <Stack spacing={1.5}>{children}</Stack>
);

const sectionLabel: Record<ResumeSectionKey, string> = {
  personalInformation: 'Personal Information',
  professionalSummary: 'Professional Summary',
  workExperience: 'Work Experience',
  education: 'Education',
  technicalSkills: 'Technical Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  publications: 'Publications & Research',
  openSource: 'Open Source Contributions',
  awards: 'Awards & Achievements',
  languages: 'Languages',
  volunteerExperience: 'Volunteer Experience',
  professionalMemberships: 'Professional Memberships',
  references: 'References',
};

const TemplateRenderer = ({ resume }: { resume: ResumeData }) => {
  const order = resume.resumeSettings.sectionOrder.filter(
    (key) => resume.resumeSettings.sectionsVisibility[key]
  );

  const sectionContent = (section: ResumeSectionKey) => {
    switch (section) {
      case 'personalInformation': {
        const info = resume.personalInformation;
        return (
          <SectionWrapper>
            <Typography variant="h5" fontWeight={700}>
              {info.firstName} {info.lastName}
            </Typography>
            <Typography variant="body2">
              {[info.email, info.phoneNumber, info.location].filter(Boolean).join(' | ')}
            </Typography>
            <Typography variant="body2">
              {[info.linkedinUrl, info.githubUrl, info.portfolioUrl].filter(Boolean).join(' | ')}
            </Typography>
          </SectionWrapper>
        );
      }
      case 'professionalSummary':
        return (
          <SectionWrapper>
            <Typography variant="body1">{resume.professionalSummary}</Typography>
          </SectionWrapper>
        );
      case 'workExperience':
        return (
          <SectionWrapper>
            {resume.workExperience.map((role) => (
              <Box key={role.id}>
                <Typography fontWeight={600}>
                  {role.jobTitle} — {role.companyName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {role.companyLocation} • {role.startDate} -{' '}
                  {role.currentlyWorking ? 'Present' : role.endDate}
                </Typography>
                {role.responsibilities.map((item, idx) => (
                  <Typography variant="body2" key={`${role.id}-resp-${idx}`}>
                    • {item}
                  </Typography>
                ))}
                {role.achievements.map((item, idx) => (
                  <Typography variant="body2" key={`${role.id}-ach-${idx}`}>
                    ◦ {item}
                  </Typography>
                ))}
                {role.technologies.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Technologies: {role.technologies.join(', ')}
                  </Typography>
                )}
              </Box>
            ))}
          </SectionWrapper>
        );
      case 'education':
        return (
          <SectionWrapper>
            {resume.education.map((item) => (
              <Box key={item.id}>
                <Typography fontWeight={600}>
                  {item.degreeType} in {item.fieldOfStudy}
                </Typography>
                <Typography variant="body2">
                  {item.institutionName} — {item.institutionLocation}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.startDate} - {item.graduationDate}
                </Typography>
                {item.gpa && <Typography variant="body2">GPA: {item.gpa}</Typography>}
                {item.coursework && (
                  <Typography variant="body2">Coursework: {item.coursework}</Typography>
                )}
                {item.honors && <Typography variant="body2">Honors: {item.honors}</Typography>}
              </Box>
            ))}
          </SectionWrapper>
        );
      case 'technicalSkills': {
        const skills = resume.technicalSkills;
        const rows = [
          { label: 'Programming Languages', value: skills.programmingLanguages },
          { label: 'Frameworks & Libraries', value: skills.frameworksLibraries },
          { label: 'Databases', value: skills.databases },
          { label: 'Cloud Platforms', value: skills.cloudPlatforms },
          { label: 'DevOps & Tools', value: skills.devOpsTools },
          { label: 'Development Tools', value: skills.developmentTools },
          { label: 'Methodologies', value: skills.methodologies },
          { label: 'Other Skills', value: skills.otherSkills },
        ];
        return (
          <SectionWrapper>
            {rows.map(
              (row) =>
                row.value.length > 0 && (
                  <Typography key={row.label} variant="body2">
                    <strong>{row.label}:</strong> {row.value.join(', ')}
                  </Typography>
                )
            )}
          </SectionWrapper>
        );
      }
      case 'projects':
        return (
          <SectionWrapper>
            {resume.projects.map((project) => (
              <Box key={project.id}>
                <Typography fontWeight={600}>
                  {project.projectName} — {project.role}
                </Typography>
                <Typography variant="body2">{project.description}</Typography>
                {project.achievements.map((item, idx) => (
                  <Typography key={`${project.id}-ach-${idx}`} variant="body2">
                    • {item}
                  </Typography>
                ))}
                <Typography variant="body2" color="text.secondary">
                  Technologies: {project.technologies.join(', ')}
                </Typography>
              </Box>
            ))}
          </SectionWrapper>
        );
      case 'certifications':
        return (
          <SectionWrapper>
            {resume.certifications.map((cert) => (
              <Typography key={cert.id} variant="body2">
                {cert.certificationName} — {cert.issuingOrganization} ({cert.issueDate}
                {cert.expirationDate ? ` - ${cert.expirationDate}` : ''})
              </Typography>
            ))}
          </SectionWrapper>
        );
      case 'publications':
        return (
          <SectionWrapper>
            {resume.publications.map((pub) => (
              <Typography key={pub.id} variant="body2">
                {pub.title} · {pub.publisher} ({pub.date}) {pub.url ? `• ${pub.url}` : ''}
              </Typography>
            ))}
          </SectionWrapper>
        );
      case 'openSource':
        return (
          <SectionWrapper>
            {resume.openSource.map((item) => (
              <Typography key={item.id} variant="body2">
                {item.projectName} — {item.contributionType} ({item.repoUrl}) • {item.description}
              </Typography>
            ))}
          </SectionWrapper>
        );
      case 'awards':
        return (
          <SectionWrapper>
            {resume.awards.map((award) => (
              <Typography key={award.id} variant="body2">
                {award.awardName} — {award.organization} ({award.date}) • {award.description}
              </Typography>
            ))}
          </SectionWrapper>
        );
      case 'languages':
        return (
          <SectionWrapper>
            {resume.languages.map((language) => (
              <Typography key={language.id} variant="body2">
                {language.language} — {language.proficiency}
              </Typography>
            ))}
          </SectionWrapper>
        );
      case 'volunteerExperience':
        return (
          <SectionWrapper>
            {resume.volunteerExperience.map((item) => (
              <Typography key={item.id} variant="body2">
                {item.organization} — {item.role} ({item.startDate} - {item.endDate}):{' '}
                {item.description}
              </Typography>
            ))}
          </SectionWrapper>
        );
      case 'professionalMemberships':
        return (
          <SectionWrapper>
            {resume.professionalMemberships.map((membership) => (
              <Typography key={membership} variant="body2">
                {membership}
              </Typography>
            ))}
          </SectionWrapper>
        );
      case 'references':
        return (
          <SectionWrapper>
            {resume.references.availableUponRequest ? (
              <Typography variant="body2">References available upon request.</Typography>
            ) : (
              resume.references.contacts.map((contact) => (
                <Typography key={contact.id} variant="body2">
                  {contact.name}, {contact.title} at {contact.company} — {contact.email} /{' '}
                  {contact.phone}
                </Typography>
              ))
            )}
          </SectionWrapper>
        );
      default:
        return null;
    }
  };

  const renderTemplateWrapper = (children: React.ReactNode) => (
    <Stack spacing={2}>{children}</Stack>
  );

  const template = resume.resumeSettings.template;

  return (
    <Box
      sx={{
        fontFamily: resume.resumeSettings.fontFamily,
        color: resume.resumeSettings.colorScheme,
        border: '1px solid #d1d5db',
        backgroundColor: '#fff',
        p: template === 'simple' ? 3 : 4,
        lineHeight: 1.5,
      }}
    >
      {renderTemplateWrapper(
        order.map((sectionKey) => (
          <Box key={sectionKey}>
            {sectionKey !== 'personalInformation' && (
              <SectionHeading title={sectionLabel[sectionKey]} />
            )}
            {sectionContent(sectionKey)}
            {template !== 'simple' && <Divider sx={{ my: 2 }} />}
          </Box>
        ))
      )}
    </Box>
  );
};

export const ResumePreview = ({
  resume,
  onUpdateResume,
  selectedResumeId,
  saveResume,
}: Props) => {
  const [aiPreview, setAiPreview] = useState(resume.tailoredResumeText ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAiFormat = async () => {
    if (!selectedResumeId || !saveResume) return;
    setLoading(true);
    setError('');
    try {
      const { formattedText, updatedResume } = await generateResumeLayout({
        resume,
        template: resume.resumeSettings.template,
      });
      setAiPreview(formattedText);
      const merged = { ...updatedResume, tailoredResumeText: formattedText };
      onUpdateResume?.(merged);
      await saveResume(merged);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfDownload = async () => {
    const blob = await buildResumePdf(resume);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${resume.resumeTitle.replace(/\s+/g, '_')}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Resume Preview ({resume.resumeSettings.template} layout)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Templates adhere to professional standards: black/gray palette, no icons or graphics.
            </Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <ButtonGroup>
            <Button variant="contained" onClick={handleAiFormat} disabled={loading || !selectedResumeId}>
              AI Format for Template
            </Button>
            <Button variant="outlined" onClick={handlePdfDownload}>
              Download PDF
            </Button>
          </ButtonGroup>
          <TemplateRenderer resume={resume} />
          {aiPreview && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  AI Formatted Text (for reference)
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: '#f3f4f6',
                    p: 2,
                    borderRadius: 1,
                    maxHeight: 200,
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                  }}
                >
                  {aiPreview}
                </Box>
              </Box>
            </>
          )}
          {loading && <Typography>Formatting with AI...</Typography>}
          <Typography variant="caption" color="text.secondary">
            Color choices limited to: {grayscalePalette.join(', ')}. Fonts limited to Arial, Times
            New Roman, or Calibri per requirements.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

