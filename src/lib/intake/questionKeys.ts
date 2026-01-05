// lib/intake/questionKeys.ts

export const INTAKE_KEYS = {
  demographics: {
    confirmed: 'demographics.confirmed',
    language: 'demographics.language',
    pcp: 'demographics.primary_care_provider',
    pharmacy: 'demographics.pharmacy',
  },
  conditions: {
    list: 'conditions.list',
    none: 'conditions.none',
    other: 'conditions.other_details',
  },
  medications: {
    list: 'medications.list',
    none: 'medications.none',
  },
  allergies: {
    list: 'allergies.list',
    none: 'allergies.none',
  },
  pregnancy: {
    status: 'pregnancy.status',
    gestationalWeeks: 'pregnancy.gestational_weeks',
    postpartum: 'pregnancy.postpartum',
  },
  consent: {
    telemedicine: 'consent.telemedicine',
    hipaa: 'consent.hipaa',
    accuracy: 'consent.accuracy_attestation',
  },
  meta: {
    version: 'meta.intake_version',
    completed: 'meta.completed_sections',
  },
} as const;