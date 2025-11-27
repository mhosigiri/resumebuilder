import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { v4 as uuid } from 'uuid';
import { TagInput } from './TagInput';
import { DEFAULT_SECTION_ORDER, grayscalePalette, professionalFonts } from '../../types/resume';
import type {
  DegreeType,
  EmploymentType,
  ResumeData,
  ResumeSectionKey,
  TemplateOption,
} from '../../types/resume';

interface ResumeFormProps {
  resume: ResumeData;
  onSave: (data: ResumeData) => Promise<void>;
  selectedResumeId: string | null;
}

const RELocationOptions = ['Yes', 'No', 'Open'] as const;
const employmentTypes: EmploymentType[] = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const degreeTypes: DegreeType[] = ["Bachelor's", "Master's", 'PhD', 'Associate', 'Bootcamp', 'Certificate'];
const languageLevels = ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'] as const;
const contributionTypes = ['Maintainer', 'Contributor'] as const;
const templateOptions: { value: TemplateOption; label: string }[] = [
  { value: 'chronological', label: 'Chronological' },
  { value: 'simple', label: 'Simple' },
  { value: 'professional', label: 'Professional' },
];

const cloneResume = (data: ResumeData): ResumeData => JSON.parse(JSON.stringify(data));

const newWorkExperience = () => ({
  id: uuid(),
  jobTitle: '',
  companyName: '',
  companyLocation: '',
  employmentType: 'Full-time' as EmploymentType,
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  responsibilities: [],
  achievements: [],
  technologies: [],
});

const newEducationItem = () => ({
  id: uuid(),
  degreeType: "Bachelor's" as DegreeType,
  fieldOfStudy: '',
  institutionName: '',
  institutionLocation: '',
  startDate: '',
  graduationDate: '',
  gpa: '',
  coursework: '',
  honors: '',
});

const newProjectItem = () => ({
  id: uuid(),
  projectName: '',
  description: '',
  role: '',
  technologies: [],
  projectUrl: '',
  githubRepo: '',
  startDate: '',
  endDate: '',
  achievements: [],
});

const newCertificationItem = () => ({
  id: uuid(),
  certificationName: '',
  issuingOrganization: '',
  issueDate: '',
  expirationDate: '',
  credentialId: '',
  credentialUrl: '',
});

const newPublicationItem = () => ({
  id: uuid(),
  title: '',
  coAuthors: '',
  date: '',
  publisher: '',
  url: '',
});

const newOpenSourceItem = () => ({
  id: uuid(),
  projectName: '',
  repoUrl: '',
  contributionType: 'Contributor' as (typeof contributionTypes)[number],
  description: '',
});

const newAwardItem = () => ({
  id: uuid(),
  awardName: '',
  organization: '',
  date: '',
  description: '',
});

const newLanguageItem = () => ({
  id: uuid(),
  language: '',
  proficiency: 'Professional' as (typeof languageLevels)[number],
});

const newVolunteerItem = () => ({
  id: uuid(),
  organization: '',
  role: '',
  startDate: '',
  endDate: '',
  description: '',
});

const newReferenceContact = () => ({
  id: uuid(),
  name: '',
  title: '',
  company: '',
  email: '',
  phone: '',
});

const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <Card>
    <CardContent>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {children}
      </Stack>
    </CardContent>
  </Card>
);

const bulletListFromText = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const bulletTextFromArray = (items: string[]) => items.join('\n');

export const ResumeForm = ({ resume, onSave, selectedResumeId }: ResumeFormProps) => {
  const [editingResume, setEditingResume] = useState<ResumeData>(cloneResume(resume));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setEditingResume(cloneResume(resume));
  }, [resume]);

  const handlePersonalInfoChange = (field: keyof ResumeData['personalInformation'], value: string) => {
    setEditingResume((prev) => ({
      ...prev,
      personalInformation: {
        ...prev.personalInformation,
        [field]: value,
      },
    }));
  };

  const handleMetaChange = (field: keyof ResumeData, value: string) => {
    setEditingResume((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWorkUpdate = (id: string, updates: Partial<ResumeData['workExperience'][number]>) => {
    setEditingResume((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleEducationUpdate = (id: string, updates: Partial<ResumeData['education'][number]>) => {
    setEditingResume((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleProjectUpdate = (id: string, updates: Partial<ResumeData['projects'][number]>) => {
    setEditingResume((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleCertificationUpdate = (id: string, updates: Partial<ResumeData['certifications'][number]>) => {
    setEditingResume((prev) => ({
      ...prev,
      certifications: prev.certifications.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handlePublicationUpdate = (id: string, updates: Partial<ResumeData['publications'][number]>) => {
    setEditingResume((prev) => ({
      ...prev,
      publications: prev.publications.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleOpenSourceUpdate = (id: string, updates: Partial<ResumeData['openSource'][number]>) => {
    setEditingResume((prev) => ({
      ...prev,
      openSource: prev.openSource.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleAwardUpdate = (id: string, updates: Partial<ResumeData['awards'][number]>) => {
    setEditingResume((prev) => ({
      ...prev,
      awards: prev.awards.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleLanguageUpdate = (id: string, updates: Partial<ResumeData['languages'][number]>) => {
    setEditingResume((prev) => ({
      ...prev,
      languages: prev.languages.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleVolunteerUpdate = (id: string, updates: Partial<ResumeData['volunteerExperience'][number]>) => {
    setEditingResume((prev) => ({
      ...prev,
      volunteerExperience: prev.volunteerExperience.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleReferenceUpdate = (id: string, updates: Partial<ResumeData['references']['contacts'][number]>) => {
    setEditingResume((prev) => ({
      ...prev,
      references: {
        ...prev.references,
        contacts: prev.references.contacts.map((contact) => (contact.id === id ? { ...contact, ...updates } : contact)),
      },
    }));
  };

  const handleTechnicalSkillChange = (
    key: keyof ResumeData['technicalSkills'],
    values: string[]
  ) => {
    setEditingResume((prev) => ({
      ...prev,
      technicalSkills: {
        ...prev.technicalSkills,
        [key]: values,
      },
    }));
  };

  const handleMembershipChange = (values: string[]) => {
    setEditingResume((prev) => ({
      ...prev,
      professionalMemberships: values,
    }));
  };

  const handleSectionVisibility = (section: ResumeSectionKey, visible: boolean) => {
    setEditingResume((prev) => ({
      ...prev,
      resumeSettings: {
        ...prev.resumeSettings,
        sectionsVisibility: {
          ...prev.resumeSettings.sectionsVisibility,
          [section]: visible,
        },
      },
    }));
  };

  const handleSectionOrder = (result: DropResult) => {
    if (!result.destination) return;
    const newOrder = Array.from(editingResume.resumeSettings.sectionOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setEditingResume((prev) => ({
      ...prev,
      resumeSettings: {
        ...prev.resumeSettings,
        sectionOrder: newOrder,
      },
    }));
  };

  const toggleReferenceAvailability = (value: boolean) => {
    setEditingResume((prev) => ({
      ...prev,
      references: {
        ...prev.references,
        availableUponRequest: value,
      },
    }));
  };

  const handleSettingsChange = <K extends keyof ResumeData['resumeSettings']>(
    key: K,
    value: ResumeData['resumeSettings'][K]
  ) => {
    setEditingResume((prev) => ({
      ...prev,
      resumeSettings: {
        ...prev.resumeSettings,
        [key]: value,
      },
    }));
  };

  const addCollectionItem = (section: ResumeSectionKey) => {
    setEditingResume((prev) => {
      const next = cloneResume(prev);
      switch (section) {
        case 'workExperience':
          next.workExperience.push(newWorkExperience());
          break;
        case 'education':
          next.education.push(newEducationItem());
          break;
        case 'projects':
          next.projects.push(newProjectItem());
          break;
        case 'certifications':
          next.certifications.push(newCertificationItem());
          break;
        case 'publications':
          next.publications.push(newPublicationItem());
          break;
        case 'openSource':
          next.openSource.push(newOpenSourceItem());
          break;
        case 'awards':
          next.awards.push(newAwardItem());
          break;
        case 'languages':
          next.languages.push(newLanguageItem());
          break;
        case 'volunteerExperience':
          next.volunteerExperience.push(newVolunteerItem());
          break;
        case 'references':
          next.references.contacts.push(newReferenceContact());
          break;
        default:
          break;
      }
      return next;
    });
  };

  const removeCollectionItem = (section: ResumeSectionKey, id: string) => {
    setEditingResume((prev) => {
      const next = cloneResume(prev);
      switch (section) {
        case 'workExperience':
          next.workExperience = next.workExperience.filter((item) => item.id !== id);
          break;
        case 'education':
          next.education = next.education.filter((item) => item.id !== id);
          break;
        case 'projects':
          next.projects = next.projects.filter((item) => item.id !== id);
          break;
        case 'certifications':
          next.certifications = next.certifications.filter((item) => item.id !== id);
          break;
        case 'publications':
          next.publications = next.publications.filter((item) => item.id !== id);
          break;
        case 'openSource':
          next.openSource = next.openSource.filter((item) => item.id !== id);
          break;
        case 'awards':
          next.awards = next.awards.filter((item) => item.id !== id);
          break;
        case 'languages':
          next.languages = next.languages.filter((item) => item.id !== id);
          break;
        case 'volunteerExperience':
          next.volunteerExperience = next.volunteerExperience.filter((item) => item.id !== id);
          break;
        case 'references':
          next.references.contacts = next.references.contacts.filter((item) => item.id !== id);
          break;
        default:
          break;
      }
      return next;
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await onSave(editingResume);
      setSuccess('Resume saved to Firestore.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const personalInfo = editingResume.personalInformation;
  const settings = editingResume.resumeSettings;

  const sectionVisibilityItems = useMemo(
    () =>
      DEFAULT_SECTION_ORDER.map((section) => ({
        section,
        label: section
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase()),
      })),
    []
  );

  return (
    <Stack spacing={3}>
      <SectionCard title="Resume Details" subtitle="Provide key metadata used for job targeting.">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Resume Title (Job Focus)"
              fullWidth
              required
              value={editingResume.resumeTitle}
              onChange={(event) => handleMetaChange('resumeTitle', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Target Role"
              fullWidth
              value={editingResume.targetRole ?? ''}
              onChange={(event) => handleMetaChange('targetRole', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Target Company"
              fullWidth
              value={editingResume.targetCompany ?? ''}
              onChange={(event) => handleMetaChange('targetCompany', event.target.value)}
            />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard
        title="Personal Information"
        subtitle="Everything in this section maps directly to the user's Firestore profile."
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="First Name"
              required
              fullWidth
              value={personalInfo.firstName}
              onChange={(event) => handlePersonalInfoChange('firstName', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Middle Name"
              fullWidth
              value={personalInfo.middleName ?? ''}
              onChange={(event) => handlePersonalInfoChange('middleName', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Last Name"
              required
              fullWidth
              value={personalInfo.lastName}
              onChange={(event) => handlePersonalInfoChange('lastName', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Preferred Name"
              fullWidth
              value={personalInfo.preferredName ?? ''}
              onChange={(event) => handlePersonalInfoChange('preferredName', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={personalInfo.email}
              onChange={(event) => handlePersonalInfoChange('email', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Phone Number"
              type="tel"
              required
              fullWidth
              value={personalInfo.phoneNumber}
              onChange={(event) => handlePersonalInfoChange('phoneNumber', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="LinkedIn Profile URL"
              fullWidth
              value={personalInfo.linkedinUrl ?? ''}
              onChange={(event) => handlePersonalInfoChange('linkedinUrl', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="GitHub Profile URL"
              fullWidth
              required
              value={personalInfo.githubUrl}
              onChange={(event) => handlePersonalInfoChange('githubUrl', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Portfolio Website"
              fullWidth
              value={personalInfo.portfolioUrl ?? ''}
              onChange={(event) => handlePersonalInfoChange('portfolioUrl', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Location (City, State/Country)"
              fullWidth
              required
              value={personalInfo.location}
              onChange={(event) => handlePersonalInfoChange('location', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="relocate-label">Willing to Relocate</InputLabel>
              <Select
                labelId="relocate-label"
                label="Willing to Relocate"
                value={personalInfo.willingToRelocate}
                onChange={(event) =>
                  handlePersonalInfoChange('willingToRelocate', event.target.value as ResumeData['personalInformation']['willingToRelocate'])
                }
              >
                {RELocationOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard
        title="Professional Summary"
        subtitle="2-4 sentences that highlight your strengths. This field feeds directly into AI tailoring."
      >
        <TextField
          label="Summary"
          multiline
          minRows={3}
          value={editingResume.professionalSummary}
          onChange={(event) => handleMetaChange('professionalSummary', event.target.value)}
          helperText="Keep it concise and focused on impact."
        />
      </SectionCard>

      <SectionCard
        title="Work Experience"
        subtitle="Reverse chronological roles with responsibilities, achievements, and technologies."
      >
        <Stack spacing={2}>
          {editingResume.workExperience.map((role) => (
            <Card key={role.id} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {role.jobTitle || 'New Role'}
                    </Typography>
                    <IconButton onClick={() => removeCollectionItem('workExperience', role.id)} size="small">
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Job Title"
                        fullWidth
                        required
                        value={role.jobTitle}
                        onChange={(event) => handleWorkUpdate(role.id, { jobTitle: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Company Name"
                        fullWidth
                        required
                        value={role.companyName}
                        onChange={(event) => handleWorkUpdate(role.id, { companyName: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Company Location"
                        fullWidth
                        value={role.companyLocation}
                        onChange={(event) => handleWorkUpdate(role.id, { companyLocation: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel id={`employment-type-${role.id}`}>Employment Type</InputLabel>
                        <Select
                          labelId={`employment-type-${role.id}`}
                          label="Employment Type"
                          value={role.employmentType}
                          onChange={(event) =>
                            handleWorkUpdate(role.id, { employmentType: event.target.value as EmploymentType })
                          }
                        >
                          {employmentTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Start Date"
                        type="month"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={role.startDate}
                        onChange={(event) => handleWorkUpdate(role.id, { startDate: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="End Date"
                        type="month"
                        disabled={role.currentlyWorking}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={role.endDate}
                        onChange={(event) => handleWorkUpdate(role.id, { endDate: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={role.currentlyWorking}
                            onChange={(event) =>
                              handleWorkUpdate(role.id, { currentlyWorking: event.target.checked })
                            }
                          />
                        }
                        label="Currently working here"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Responsibilities (one per line)"
                        multiline
                        minRows={3}
                        value={bulletTextFromArray(role.responsibilities)}
                        onChange={(event) =>
                          handleWorkUpdate(role.id, {
                            responsibilities: bulletListFromText(event.target.value),
                          })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Key Achievements (one per line)"
                        multiline
                        minRows={3}
                        value={bulletTextFromArray(role.achievements)}
                        onChange={(event) =>
                          handleWorkUpdate(role.id, {
                            achievements: bulletListFromText(event.target.value),
                          })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TagInput
                        label="Technologies Used"
                        values={role.technologies}
                        onChange={(values) => handleWorkUpdate(role.id, { technologies: values })}
                        placeholder="e.g., React, Node.js, PostgreSQL"
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => addCollectionItem('workExperience')}
          >
            Add Work Experience
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard title="Education" subtitle="Academic credentials with honors and coursework.">
        <Stack spacing={2}>
          {editingResume.education.map((item) => (
            <Card key={item.id} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {item.degreeType} — {item.institutionName || 'Institution'}
                    </Typography>
                    <IconButton onClick={() => removeCollectionItem('education', item.id)} size="small">
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel id={`degree-${item.id}`}>Degree Type</InputLabel>
                        <Select
                          labelId={`degree-${item.id}`}
                          label="Degree Type"
                          value={item.degreeType}
                          onChange={(event) =>
                            handleEducationUpdate(item.id, { degreeType: event.target.value as DegreeType })
                          }
                        >
                          {degreeTypes.map((degree) => (
                            <MenuItem key={degree} value={degree}>
                              {degree}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Field of Study / Major"
                        fullWidth
                        value={item.fieldOfStudy}
                        onChange={(event) => handleEducationUpdate(item.id, { fieldOfStudy: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Institution Name"
                        fullWidth
                        value={item.institutionName}
                        onChange={(event) =>
                          handleEducationUpdate(item.id, { institutionName: event.target.value })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Institution Location"
                        fullWidth
                        value={item.institutionLocation}
                        onChange={(event) =>
                          handleEducationUpdate(item.id, { institutionLocation: event.target.value })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Start Date"
                        type="month"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={item.startDate}
                        onChange={(event) => handleEducationUpdate(item.id, { startDate: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Graduation Date (or Expected)"
                        type="month"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={item.graduationDate}
                        onChange={(event) => handleEducationUpdate(item.id, { graduationDate: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="GPA"
                        fullWidth
                        value={item.gpa ?? ''}
                        onChange={(event) => handleEducationUpdate(item.id, { gpa: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Relevant Coursework (comma separated)"
                        fullWidth
                        value={item.coursework ?? ''}
                        onChange={(event) => handleEducationUpdate(item.id, { coursework: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Honors / Awards"
                        fullWidth
                        value={item.honors ?? ''}
                        onChange={(event) => handleEducationUpdate(item.id, { honors: event.target.value })}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => addCollectionItem('education')}
          >
            Add Education Entry
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard title="Technical Skills" subtitle="Group related technologies into standardized buckets.">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TagInput
              label="Programming Languages"
              values={editingResume.technicalSkills.programmingLanguages}
              onChange={(values) => handleTechnicalSkillChange('programmingLanguages', values)}
              placeholder="JavaScript, Python, Go"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TagInput
              label="Frameworks & Libraries"
              values={editingResume.technicalSkills.frameworksLibraries}
              onChange={(values) => handleTechnicalSkillChange('frameworksLibraries', values)}
              placeholder="React, Express, Spring"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TagInput
              label="Databases"
              values={editingResume.technicalSkills.databases}
              onChange={(values) => handleTechnicalSkillChange('databases', values)}
              placeholder="PostgreSQL, MongoDB"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TagInput
              label="Cloud Platforms"
              values={editingResume.technicalSkills.cloudPlatforms}
              onChange={(values) => handleTechnicalSkillChange('cloudPlatforms', values)}
              placeholder="AWS, Azure, GCP"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TagInput
              label="DevOps & Tools"
              values={editingResume.technicalSkills.devOpsTools}
              onChange={(values) => handleTechnicalSkillChange('devOpsTools', values)}
              placeholder="Docker, Kubernetes, CI/CD"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TagInput
              label="Development Tools"
              values={editingResume.technicalSkills.developmentTools}
              onChange={(values) => handleTechnicalSkillChange('developmentTools', values)}
              placeholder="VS Code, Git, Jira"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TagInput
              label="Methodologies"
              values={editingResume.technicalSkills.methodologies}
              onChange={(values) => handleTechnicalSkillChange('methodologies', values)}
              placeholder="Agile, Scrum, TDD"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TagInput
              label="Other Technical Skills"
              values={editingResume.technicalSkills.otherSkills}
              onChange={(values) => handleTechnicalSkillChange('otherSkills', values)}
              placeholder="Accessibility, Data Visualization"
            />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard
        title="Projects"
        subtitle="Highlight high-impact projects and ensure AI can reference URLs."
      >
        <Stack spacing={2}>
          {editingResume.projects.map((project) => (
            <Card key={project.id} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {project.projectName || 'New Project'}
                    </Typography>
                    <IconButton onClick={() => removeCollectionItem('projects', project.id)} size="small">
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Project Name"
                        fullWidth
                        value={project.projectName}
                        onChange={(event) => handleProjectUpdate(project.id, { projectName: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Role / Contribution"
                        fullWidth
                        value={project.role}
                        onChange={(event) => handleProjectUpdate(project.id, { role: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Description"
                        multiline
                        minRows={3}
                        value={project.description}
                        onChange={(event) => handleProjectUpdate(project.id, { description: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TagInput
                        label="Technologies"
                        values={project.technologies}
                        onChange={(values) => handleProjectUpdate(project.id, { technologies: values })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Project URL / Demo"
                        fullWidth
                        value={project.projectUrl ?? ''}
                        onChange={(event) => handleProjectUpdate(project.id, { projectUrl: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="GitHub Repo"
                        fullWidth
                        value={project.githubRepo ?? ''}
                        onChange={(event) => handleProjectUpdate(project.id, { githubRepo: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Start Date"
                        type="month"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={project.startDate ?? ''}
                        onChange={(event) => handleProjectUpdate(project.id, { startDate: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="End Date"
                        type="month"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={project.endDate ?? ''}
                        onChange={(event) => handleProjectUpdate(project.id, { endDate: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Key Features / Achievements (one per line)"
                        multiline
                        minRows={3}
                        value={bulletTextFromArray(project.achievements)}
                        onChange={(event) =>
                          handleProjectUpdate(project.id, {
                            achievements: bulletListFromText(event.target.value),
                          })
                        }
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => addCollectionItem('projects')}
          >
            Add Project
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard title="Certifications" subtitle="Industry certifications with credential references.">
        <Stack spacing={2}>
          {editingResume.certifications.map((cert) => (
            <Card key={cert.id} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {cert.certificationName || 'Certification'}
                    </Typography>
                    <IconButton onClick={() => removeCollectionItem('certifications', cert.id)} size="small">
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Certification Name"
                        fullWidth
                        value={cert.certificationName}
                        onChange={(event) =>
                          handleCertificationUpdate(cert.id, { certificationName: event.target.value })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Issuing Organization"
                        fullWidth
                        value={cert.issuingOrganization}
                        onChange={(event) =>
                          handleCertificationUpdate(cert.id, { issuingOrganization: event.target.value })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Issue Date"
                        type="month"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={cert.issueDate}
                        onChange={(event) => handleCertificationUpdate(cert.id, { issueDate: event.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Expiration Date"
                        type="month"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={cert.expirationDate ?? ''}
                        onChange={(event) =>
                          handleCertificationUpdate(cert.id, { expirationDate: event.target.value })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Credential ID"
                        fullWidth
                        value={cert.credentialId ?? ''}
                        onChange={(event) =>
                          handleCertificationUpdate(cert.id, { credentialId: event.target.value })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Credential URL"
                        fullWidth
                        value={cert.credentialUrl ?? ''}
                        onChange={(event) =>
                          handleCertificationUpdate(cert.id, { credentialUrl: event.target.value })
                        }
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => addCollectionItem('certifications')}
          >
            Add Certification
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard title="Additional Sections" subtitle="Optional entries follow the same Firestore structure.">
        <Stack spacing={4}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Publications & Research
            </Typography>
            <Stack spacing={2}>
              {editingResume.publications.map((pub) => (
                <Card key={pub.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography>{pub.title || 'Publication'}</Typography>
                        <IconButton onClick={() => removeCollectionItem('publications', pub.id)} size="small">
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Title"
                            fullWidth
                            value={pub.title}
                            onChange={(event) => handlePublicationUpdate(pub.id, { title: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Co-authors"
                            fullWidth
                            value={pub.coAuthors ?? ''}
                            onChange={(event) => handlePublicationUpdate(pub.id, { coAuthors: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Date"
                            type="month"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={pub.date ?? ''}
                            onChange={(event) => handlePublicationUpdate(pub.id, { date: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Publisher / Conference"
                            fullWidth
                            value={pub.publisher ?? ''}
                            onChange={(event) => handlePublicationUpdate(pub.id, { publisher: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            label="URL / DOI"
                            fullWidth
                            value={pub.url ?? ''}
                            onChange={(event) => handlePublicationUpdate(pub.id, { url: event.target.value })}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addCollectionItem('publications')}>
                Add Publication
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Open Source Contributions
            </Typography>
            <Stack spacing={2}>
              {editingResume.openSource.map((record) => (
                <Card key={record.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography>{record.projectName || 'Open Source Project'}</Typography>
                        <IconButton onClick={() => removeCollectionItem('openSource', record.id)} size="small">
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Project Name"
                            fullWidth
                            value={record.projectName}
                            onChange={(event) =>
                              handleOpenSourceUpdate(record.id, { projectName: event.target.value })
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Repository URL"
                            fullWidth
                            value={record.repoUrl}
                            onChange={(event) => handleOpenSourceUpdate(record.id, { repoUrl: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth>
                            <InputLabel id={`contribution-${record.id}`}>Contribution Type</InputLabel>
                            <Select
                              labelId={`contribution-${record.id}`}
                              label="Contribution Type"
                              value={record.contributionType}
                              onChange={(event) =>
                                handleOpenSourceUpdate(record.id, {
                                  contributionType: event.target.value as (typeof contributionTypes)[number],
                                })
                              }
                            >
                              {contributionTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            label="Description"
                            multiline
                            minRows={3}
                            value={record.description}
                            onChange={(event) =>
                              handleOpenSourceUpdate(record.id, { description: event.target.value })
                            }
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addCollectionItem('openSource')}>
                Add Open Source Entry
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Awards & Achievements
            </Typography>
            <Stack spacing={2}>
              {editingResume.awards.map((award) => (
                <Card key={award.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography>{award.awardName || 'Award'}</Typography>
                        <IconButton onClick={() => removeCollectionItem('awards', award.id)} size="small">
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Award Name"
                            fullWidth
                            value={award.awardName}
                            onChange={(event) => handleAwardUpdate(award.id, { awardName: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Organization"
                            fullWidth
                            value={award.organization}
                            onChange={(event) => handleAwardUpdate(award.id, { organization: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Date"
                            type="month"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={award.date}
                            onChange={(event) => handleAwardUpdate(award.id, { date: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            label="Description"
                            multiline
                            minRows={2}
                            value={award.description}
                            onChange={(event) => handleAwardUpdate(award.id, { description: event.target.value })}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addCollectionItem('awards')}>
                Add Award
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Languages
            </Typography>
            <Stack spacing={2}>
              {editingResume.languages.map((entry) => (
                <Card key={entry.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography>{entry.language || 'Language'}</Typography>
                        <IconButton onClick={() => removeCollectionItem('languages', entry.id)} size="small">
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Language"
                            fullWidth
                            value={entry.language}
                            onChange={(event) => handleLanguageUpdate(entry.id, { language: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth>
                            <InputLabel id={`language-prof-${entry.id}`}>Proficiency</InputLabel>
                            <Select
                              labelId={`language-prof-${entry.id}`}
                              label="Proficiency"
                              value={entry.proficiency}
                              onChange={(event) =>
                                handleLanguageUpdate(entry.id, {
                                  proficiency: event.target.value as (typeof languageLevels)[number],
                                })
                              }
                            >
                              {languageLevels.map((level) => (
                                <MenuItem key={level} value={level}>
                                  {level}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addCollectionItem('languages')}>
                Add Language
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Volunteer Experience
            </Typography>
            <Stack spacing={2}>
              {editingResume.volunteerExperience.map((record) => (
                <Card key={record.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography>{record.organization || 'Organization'}</Typography>
                        <IconButton onClick={() => removeCollectionItem('volunteerExperience', record.id)} size="small">
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Organization"
                            fullWidth
                            value={record.organization}
                            onChange={(event) =>
                              handleVolunteerUpdate(record.id, { organization: event.target.value })
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Role"
                            fullWidth
                            value={record.role}
                            onChange={(event) => handleVolunteerUpdate(record.id, { role: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Start Date"
                            type="month"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={record.startDate}
                            onChange={(event) => handleVolunteerUpdate(record.id, { startDate: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="End Date"
                            type="month"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={record.endDate}
                            onChange={(event) => handleVolunteerUpdate(record.id, { endDate: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            label="Description"
                            multiline
                            minRows={2}
                            value={record.description}
                            onChange={(event) =>
                              handleVolunteerUpdate(record.id, { description: event.target.value })
                            }
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => addCollectionItem('volunteerExperience')}
              >
                Add Volunteer Experience
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Professional Memberships
            </Typography>
            <TagInput
              label="Membership Organizations"
              values={editingResume.professionalMemberships}
              onChange={handleMembershipChange}
              placeholder="IEEE, ACM, DevGuild"
            />
          </Stack>
        </Stack>
      </SectionCard>

      <SectionCard title="References" subtitle="Toggle privacy or capture trusted contacts.">
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={editingResume.references.availableUponRequest}
                onChange={(event) => toggleReferenceAvailability(event.target.checked)}
              />
            }
            label="References available upon request"
          />
          {!editingResume.references.availableUponRequest && (
            <Stack spacing={2}>
              {editingResume.references.contacts.map((contact) => (
                <Card key={contact.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography>{contact.name || 'Reference Contact'}</Typography>
                        <IconButton onClick={() => removeCollectionItem('references', contact.id)} size="small">
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Name"
                            fullWidth
                            value={contact.name}
                            onChange={(event) => handleReferenceUpdate(contact.id, { name: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Title"
                            fullWidth
                            value={contact.title}
                            onChange={(event) => handleReferenceUpdate(contact.id, { title: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Company"
                            fullWidth
                            value={contact.company}
                            onChange={(event) => handleReferenceUpdate(contact.id, { company: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={contact.email}
                            onChange={(event) => handleReferenceUpdate(contact.id, { email: event.target.value })}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Phone"
                            type="tel"
                            fullWidth
                            value={contact.phone}
                            onChange={(event) => handleReferenceUpdate(contact.id, { phone: event.target.value })}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addCollectionItem('references')}>
                Add Reference
              </Button>
            </Stack>
          )}
        </Stack>
      </SectionCard>

      <SectionCard
        title="Resume Settings & Template Controls"
        subtitle="Restrict templates to chronological, simple, or professional formats. Fonts and colors stay within brand-safe options."
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Template Style
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={settings.template}
              onChange={(_, value: TemplateOption | null) => value && handleSettingsChange('template', value)}
              size="small"
              sx={{ mt: 1 }}
            >
              {templateOptions.map((option) => (
                <ToggleButton key={option.value} value={option.value}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="font-family-label">Font Selection</InputLabel>
                <Select
                  labelId="font-family-label"
                  label="Font Selection"
                  value={settings.fontFamily}
                  onChange={(event) =>
                    handleSettingsChange('fontFamily', event.target.value as ResumeData['resumeSettings']['fontFamily'])
                  }
                >
                  {professionalFonts.map((font) => (
                    <MenuItem key={font} value={font}>
                      {font}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Only Arial, Times New Roman, and Calibri are permitted.</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Color Scheme (Grayscale only)
                </Typography>
                <Stack direction="row" spacing={1}>
                  {grayscalePalette.map((color) => (
                    <Chip
                      key={color}
                      label={color}
                      onClick={() => handleSettingsChange('colorScheme', color)}
                      variant={settings.colorScheme === color ? 'filled' : 'outlined'}
                      sx={{
                        backgroundColor: settings.colorScheme === color ? color : undefined,
                        color: settings.colorScheme === color ? '#fff' : 'inherit',
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Section Order (drag to reorder)
            </Typography>
            <DragDropContext onDragEnd={handleSectionOrder}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <Stack
                    spacing={1}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ backgroundColor: '#f9fafb', p: 2, borderRadius: 2 }}
                  >
                    {settings.sectionOrder.map((section, index) => (
                      <Draggable key={section} draggableId={section} index={index}>
                        {(drag) => (
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            sx={{
                              backgroundColor: '#fff',
                              borderRadius: 1.5,
                              border: '1px solid #e5e7eb',
                              px: 2,
                              py: 1,
                            }}
                          >
                            <Box {...drag.dragHandleProps}>
                              <DragIndicatorIcon fontSize="small" />
                            </Box>
                            <Typography flexGrow={1}>
                              {section
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, (str) => str.toUpperCase())}
                            </Typography>
                          </Stack>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            </DragDropContext>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Section Visibility
            </Typography>
            <Grid container spacing={1}>
              {sectionVisibilityItems.map(({ section, label }) => (
                <Grid key={section} size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sectionsVisibility[section]}
                        onChange={(event) => handleSectionVisibility(section, event.target.checked)}
                        disabled={section === 'personalInformation'}
                      />
                    }
                    label={label}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </SectionCard>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
        <Button variant="contained" onClick={handleSave} disabled={!selectedResumeId || saving}>
          {saving ? 'Saving...' : 'Save changes to Firestore'}
        </Button>
      </Stack>
    </Stack>
  );
};


