export const SUPPORTED_UPLOAD_TYPES = {
  pdf: {
    ext: '.pdf',
    description: 'Customer PDFs — case studies, reports, exported emails',
    mime: 'application/pdf'
  },
  csv: {
    ext: '.csv',
    description: 'CSV exports — NPS surveys, review dumps, CRM notes (one row or column of text per record)',
    mime: 'text/csv'
  },
  txt: {
    ext: '.txt',
    description: 'Plain text — testimonials, transcripts, support logs, pasted email threads',
    mime: 'text/plain'
  }
} as const;

export const SUPPORTED_PASTE_TYPES = [
  'Customer emails',
  'Testimonials & reviews',
  'Sales call transcripts',
  'Support conversations',
  'Survey / NPS responses',
  'Slack or community comments'
];
