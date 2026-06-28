import type { ObjectClass } from './index.js'

export const DIS_CATEGORIES: Record<string, string> = {
  AR: 'Architecture',
  BU: 'Business',
  KN: 'Knowledge',
  SW: 'Software',
  HR: 'Human Resources',
  LG: 'Legal',
  MK: 'Marketing',
  FN: 'Finance',
}

export const DIS_SUBSYSTEMS: Record<string, string> = {
  OS: 'Divad OS',
  KE: 'Engineering Knowledge Engine',
  KI: 'Knowledge Ingestion Engine',
  KV: 'Knowledge Validation Engine',
  KC: 'Knowledge Core Engine',
  KD: 'Knowledge Delivery Engine',
  CM: 'COIM',
  RP: 'Repository',
  SY: 'Systems',
  GN: 'General',
}

export const DIS_TYPES: Record<string, string> = {
  PR: 'PRD',
  SP: 'Specification',
  IP: 'Implementation Plan',
  SO: 'SOP',
  MN: 'Manual',
  DR: 'Decision Record',
  AP: 'Architecture Phase',
  AO: 'Architecture Objective',
  AT: 'Architecture Task',
  KO: 'Knowledge Object',
  PK: 'Pending Knowledge Object',
  RO: 'Reasoning Object',
  TS: 'Test Suite',
  UI: 'UI Specification',
  RE: 'Report',
  ST: 'Standard',
  PL: 'Plan',
  NT: 'Note',
  RS: 'Research',
  RK: 'Risk Register',
  MT: 'Meeting Notes',
}

export const DIS_OBJECT_CLASSES: ObjectClass[] = [
  'Physical', 'Logical', 'Knowledge', 'Reference', 'Configuration',
  'AI', 'Workflow', 'Relationship', 'Evidence', 'Observation',
  'Reasoning', 'Validation',
]
