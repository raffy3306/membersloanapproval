import {
  googleAppsScriptConfig,
  hasGoogleAppsScriptUrl,
} from '../config/googleAppsScript';

export type AppsScriptConnectionState =
  | 'not-configured'
  | 'checking'
  | 'connected'
  | 'failed';

export type BackendHealth = {
  appName: string;
  version: string;
  serverTime: string;
  scriptId?: string;
  spreadsheetName?: string;
  spreadsheetConfigured?: boolean;
  usersSheetConfigured?: boolean;
  masterListSheetConfigured?: boolean;
  loanTypeSheetConfigured?: boolean;
  requestsSheetConfigured?: boolean;
  otherLoansSheetConfigured?: boolean;
  comakersSheetConfigured?: boolean;
  securitiesSheetConfigured?: boolean;
};

export type AuthenticatedUser = {
  email: string;
  role: string;
  fullname: string;
  position: string;
  branchid: string;
  firstLogin: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoanRequestStatus =
  | 'Pending'
  | 'Forwarded'
  | 'Returned'
  | 'Returned to Manager'
  | 'Approved'
  | 'Disapproved'
  | 'Rejected'
  | string;

export type LoanRequest = {
  requestId: string;
  memberName: string;
  loanType: string;
  amount: string;
  status: LoanRequestStatus;
  requestedAt: string;
  decidedAt: string;
  requestedBy: string;
  requestedByName: string;
  branchid: string;
  remarks: string;
  managerNotes: string;
  approverNotes: string;
  managerBy: string;
  managerByName: string;
  reviewAndRecommendations?: string;
  dateOfApproval?: string;
  loanAmountApproved?: string;
  additionalRequirements?: string;
};

export type LoanRequestListResponse = {
  requests: LoanRequest[];
  sheetConfigured: boolean;
};

export type LoanRequestListPayload = {
  dashboard: 'teller' | 'manager' | 'approver';
  view: 'pending' | 'history';
  email: string;
  branchid: string;
};

export type NewLoanRequest = {
  request_id?: string;
  request_date: string;
  cif_key: string;
  fullname: string;
  address: string;
  age: string;
  share_capital: string;
  date_of_retirement: string;
  loan_type: string;
  amount_applied: string;
  loan_balance: string;
  other_loans: string;
  employer: string;
  position: string;
  employers_address: string;
  monthly_pension: string;
  current_nthp: string;
  analysis_nthp: string;
  comaker1: string;
  comaker2: string;
  comaker3: string;
  comaker4: string;
  appraisal_result: string;
  recommendation: string;
};

export type NewOtherLoan = {
  loan_type: string;
  loan_amount: string;
  balance: string;
  status: string;
  analysis: string;
};

export type NewComaker = {
  fullname: string;
  loan_type: string;
  loan_amount: string;
  loan_balance: string;
  status: string;
};

export type NewSecurity = {
  nature: string;
  market_value: string;
  appraised_value: string;
};

export type LoanRequestDetails = {
  request: NewLoanRequest;
  otherLoans: NewOtherLoan[];
  comakers: NewComaker[];
  securities: NewSecurity[];
  status: LoanRequestStatus;
  requestedBy: string;
  requestedByName: string;
  branchid: string;
  managerNotes: string;
  approverNotes: string;
  managerBy: string;
  managerByName: string;
  reviewAndRecommendations?: string;
  dateOfApproval?: string;
  loanAmountApproved?: string;
  additionalRequirements?: string;
};

export type GetLoanRequestDetailsPayload = {
  requestId: string;
};

export type Member = {
  cif_key: string;
  client_name: string;
  membership_date: string;
  membership_type: string;
  sex: string;
  age: string;
  birthdate: string;
  contactnumber: string;
  address: string;
  branch_id: string;
  status: string;
  tin_number: string;
  occupation: string;
  educational_attainment: string;
};

export type SearchMembersPayload = {
  query: string;
};

export type SearchMembersResponse = {
  members: Member[];
  sheetConfigured: boolean;
};

export type LoanType = {
  loan_id: string;
  loantype: string;
  description: string;
};

export type GetLoanTypesResponse = {
  loanTypes: LoanType[];
  sheetConfigured: boolean;
};

export type ComakerLoan = {
  loan_type: string;
  loan_amount: string;
  balance: string;
  status: string;
};

export type GetComakerLoansPayload = {
  cif_key: string;
};

export type GetComakerLoansResponse = {
  loans: ComakerLoan[];
};

export type CreateLoanRequestPayload = {
  request: NewLoanRequest;
  otherLoans: NewOtherLoan[];
  comakers: NewComaker[];
  securities: NewSecurity[];
  createdBy: string;
  createdByName: string;
  branchid: string;
};

export type CreateLoanRequestResponse = {
  requestId: string;
  requestDate: string;
  otherLoansSaved: number;
  comakersSaved: number;
  securitiesSaved: number;
};

export type UpdateLoanRequestResponse = CreateLoanRequestResponse & {
  updated: boolean;
};

export type ForwardLoanRequestPayload = {
  requestId: string;
  managerBy?: string;
  managerByName?: string;
  notes?: string;
};

export type ForwardLoanRequestResponse = {
  requestId: string;
  status: 'Forwarded';
  managerNotes: string;
  managerBy: string;
  managerByName: string;
};

export type ReturnLoanRequestPayload = {
  requestId: string;
  notes: string;
};

export type ReturnLoanRequestResponse = {
  requestId: string;
  status: 'Returned';
  managerNotes: string;
};

export type DecideLoanRequestPayload = {
  requestId: string;
  reviewAndRecommendations?: string;
  dateOfApproval?: string;
  loanAmountApproved?: string;
  additionalRequirements?: string;
};

export type ReturnToManagerPayload = {
  requestId: string;
  notes: string;
};

export type ApproveLoanRequestResponse = {
  requestId: string;
  status: 'Approved';
  managerNotes: string;
  reviewAndRecommendations?: string;
  dateOfApproval?: string;
  loanAmountApproved?: string;
  additionalRequirements?: string;
};

export type DisapproveLoanRequestResponse = {
  requestId: string;
  status: 'Disapproved';
  managerNotes: string;
  reviewAndRecommendations?: string;
  dateOfApproval?: string;
  loanAmountApproved?: string;
  additionalRequirements?: string;
};

export type ReturnToManagerResponse = {
  requestId: string;
  status: 'Returned to Manager';
  managerNotes: string;
  approverNotes: string;
};

type AppsScriptResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export class AppsScriptConfigurationError extends Error {
  constructor() {
    super('Google Apps Script web app URL is not configured.');
    this.name = 'AppsScriptConfigurationError';
  }
}

const parseResponse = <T>(rawText: string): T => {
  try {
    const parsed = JSON.parse(rawText) as AppsScriptResponse<T> | T;

    if (isAppsScriptEnvelope<T>(parsed)) {
      if (!parsed.ok) {
        throw new Error(parsed.error || 'Google Apps Script returned an error.');
      }

      return parsed.data as T;
    }

    return parsed as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Google Apps Script returned a non-JSON response.');
    }

    throw error;
  }
};

const isAppsScriptEnvelope = <T>(
  value: AppsScriptResponse<T> | T,
): value is AppsScriptResponse<T> => {
  return typeof value === 'object' && value !== null && 'ok' in value;
};

const buildUrl = (action: string) => {
  const url = new URL(googleAppsScriptConfig.webAppUrl);
  url.searchParams.set('action', action);
  return url.toString();
};

export const callAppsScript = async <T>(
  action: string,
  payload?: Record<string, unknown>,
): Promise<T> => {
  if (!hasGoogleAppsScriptUrl) {
    throw new AppsScriptConfigurationError();
  }

  const response = await fetch(buildUrl(action), {
    method: payload ? 'POST' : 'GET',
    redirect: 'follow',
    headers: payload ? { 'Content-Type': 'text/plain;charset=utf-8' } : undefined,
    body: payload ? JSON.stringify({ action, payload }) : undefined,
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(rawText || `Request failed with status ${response.status}.`);
  }

  return parseResponse<T>(rawText);
};

export const checkBackendHealth = () => callAppsScript<BackendHealth>('health');

export const loginUser = (credentials: LoginCredentials) =>
  callAppsScript<AuthenticatedUser>('login', credentials);

export const listLoanRequests = (payload: LoanRequestListPayload) =>
  callAppsScript<LoanRequestListResponse>('listRequests', payload);

export const getLoanRequestDetails = (payload: GetLoanRequestDetailsPayload) =>
  callAppsScript<LoanRequestDetails>('getRequestDetails', payload);

export const searchMembers = (payload: SearchMembersPayload) =>
  callAppsScript<SearchMembersResponse>('searchMembers', payload);

export const getLoanTypes = () =>
  callAppsScript<GetLoanTypesResponse>('getLoanTypes', {});

export const getComakerLoans = (payload: GetComakerLoansPayload) =>
  callAppsScript<GetComakerLoansResponse>('getComakerLoans', payload);

export const createLoanRequest = (payload: CreateLoanRequestPayload) =>
  callAppsScript<CreateLoanRequestResponse>('createRequest', payload);

export const updateLoanRequest = (payload: CreateLoanRequestPayload) =>
  callAppsScript<UpdateLoanRequestResponse>('updateRequest', payload);

export const forwardLoanRequest = (payload: ForwardLoanRequestPayload) =>
  callAppsScript<ForwardLoanRequestResponse>('forwardRequest', payload);

export const returnLoanRequest = (payload: ReturnLoanRequestPayload) =>
  callAppsScript<ReturnLoanRequestResponse>('returnRequest', payload);

export const approveLoanRequest = (payload: DecideLoanRequestPayload) =>
  callAppsScript<ApproveLoanRequestResponse>('approveRequest', payload);

export const disapproveLoanRequest = (payload: DecideLoanRequestPayload) =>
  callAppsScript<DisapproveLoanRequestResponse>('disapproveRequest', payload);

export const returnLoanRequestToManager = (payload: ReturnToManagerPayload) =>
  callAppsScript<ReturnToManagerResponse>('returnToManager', payload);
