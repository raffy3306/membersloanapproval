import { laravelApiConfig } from '../config/laravelApi';

export type BackendConnectionState =
  | 'not-configured'
  | 'checking'
  | 'connected'
  | 'failed';

export type BackendHealth = {
  appName: string;
  version: string;
  serverTime: string;
  database?: string;
  databaseConfigured?: boolean;
  usersTableConfigured?: boolean;
  membersTableConfigured?: boolean;
  loanTypesTableConfigured?: boolean;
  requestsTableConfigured?: boolean;
  otherLoansTableConfigured?: boolean;
  comakersTableConfigured?: boolean;
  securitiesTableConfigured?: boolean;
  attachmentsTableConfigured?: boolean;
  branchesTableConfigured?: boolean;
  settingsTableConfigured?: boolean;
};

export type AuthenticatedUser = {
  id?: string;
  email: string;
  role: string;
  fullname: string;
  position: string;
  branchid: string;
  branchName?: string;
  firstLogin: boolean;
  status: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type ChangePasswordPayload = {
  email: string;
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  success: boolean;
  message?: string;
  user?: AuthenticatedUser;
};

export type PasswordRecoveryResponse = {
  success: boolean;
  message?: string;
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
  branchName?: string;
  remarks: string;
  managerNotes: string;
  approverNotes: string;
  managerBy: string;
  managerByName: string;
  approverBy: string;
  approverByName: string;
  reviewAndRecommendations?: string;
  dateOfApproval?: string;
  loanAmountApproved?: string;
  additionalRequirements?: string;
};

export type LoanRequestListPayload = {
  dashboard: 'teller' | 'manager' | 'approver' | 'admin';
  view: 'pending' | 'history';
  email: string;
  branchid: string;
};

export type LoanRequestListResponse = {
  requests: LoanRequest[];
  sheetConfigured: boolean;
  pagination?: PaginationInfo;
};

export type PaginationInfo = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
  has_more: boolean;
};

export type Member = {
  id?: string;
  cif_key: string;
  client_name: string;
  membership_date: string;
  membership_type: string;
  sex: string;
  age: string;
  birthdate: string;
  contactnumber: string;
  address: string;
  share_capital: string;
  date_of_retirement: string;
  branch_id: string;
  branch_name?: string;
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
  pagination?: PaginationInfo;
};

export type ListMembersPayload = {
  query?: string;
  limit?: number;
  perPage?: number;
  page?: number;
};

export type AdminMemberInput = Partial<Member> & {
  cif_key: string;
  client_name: string;
};

export type SaveMemberResponse = {
  success: boolean;
  message?: string;
  member?: Member;
};

export type BulkDeleteResponse = {
  success: boolean;
  message?: string;
  deletedCount: number;
};

export type ImportMemberError = {
  row?: number;
  cif_key?: string;
  message: string;
};

export type ImportMembersResponse = {
  created: number;
  updated: number;
  failed: number;
  errors?: ImportMemberError[];
};

export type LoanType = {
  loan_id: string;
  loantype: string;
  description: string;
  minimumAmount: string;
  maximumAmount: string;
  maximumTermMonths: string;
  interestRate: string;
  isActive: boolean;
};

export type GetLoanTypesResponse = {
  loanTypes: LoanType[];
  pagination?: PaginationInfo;
};

export type AdminLoanTypeInput = LoanType;

export type SaveLoanTypeResponse = {
  success: boolean;
  message?: string;
  loanType?: LoanType;
};

export type Branch = {
  id: string;
  branch_code: string;
  branch_name: string;
  address?: string;
  phone?: string;
};

export type GetBranchesResponse = {
  branches: Branch[];
  pagination?: PaginationInfo;
};

export type AdminBranchInput = Partial<Branch> & {
  branch_code: string;
  branch_name: string;
};

export type SaveBranchResponse = {
  success: boolean;
  message?: string;
  branch?: Branch;
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

export type LoanAttachment = {
  id: string;
  loanRequestId: string;
  attachmentType: string;
  originalFilename: string;
  mimeType: string;
  size: string;
  uploadedAt: string;
};

export type NewAttachmentUpload = {
  attachmentType: string;
  file: File;
};

export type AttachmentTypeUpdate = {
  id: string;
  attachmentType: string;
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

export type CreateLoanRequestPayload = {
  branchid: string;
  createdBy: string;
  createdByName: string;
  otherLoans: NewOtherLoan[];
  comakers: NewComaker[];
  securities: NewSecurity[];
  attachmentUploads?: NewAttachmentUpload[];
  attachmentUpdates?: AttachmentTypeUpdate[];
  request: NewLoanRequest;
};

export type CreateLoanRequestResponse = {
  requestId: string;
  status: LoanRequestStatus;
};

export type UpdateLoanRequestResponse = CreateLoanRequestResponse;

export type GetLoanRequestDetailsPayload = {
  requestId: string;
};

export type LoanRequestDetails = {
  status: LoanRequestStatus;
  request: NewLoanRequest;
  otherLoans: NewOtherLoan[];
  comakers: NewComaker[];
  securities: NewSecurity[];
  attachments: LoanAttachment[];
  requestedBy: string;
  requestedByName: string;
  branchid: string;
  branchName?: string;
  managerBy: string;
  managerByName: string;
  approverBy: string;
  approverByName: string;
  managerNotes: string;
  approverNotes: string;
  reviewAndRecommendations?: string;
  dateOfApproval?: string;
  loanAmountApproved?: string;
  additionalRequirements?: string;
};

export type GetComakerLoansPayload = {
  cifKey?: string;
  fullname?: string;
};

export type ComakerLoan = {
  loan_type: string;
  loan_amount: string;
  loan_balance: string;
  status: string;
};

export type GetComakerLoansResponse = {
  loans: ComakerLoan[];
};

export type ForwardLoanRequestPayload = {
  requestId: string;
  notes: string;
  managerBy?: string;
  managerByName?: string;
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
  approverBy?: string;
  approverByName?: string;
  reviewAndRecommendations?: string;
  loanAmountApproved?: string;
  additionalRequirements?: string;
  notes?: string;
};

export type ReturnToManagerPayload = {
  requestId: string;
  notes: string;
  approverBy?: string;
  approverByName?: string;
};

export type ApproveLoanRequestResponse = {
  requestId: string;
  status: 'Approved';
  managerNotes: string;
  approverBy: string;
  approverByName: string;
  reviewAndRecommendations?: string;
  dateOfApproval?: string;
  loanAmountApproved?: string;
  additionalRequirements?: string;
};

export type DisapproveLoanRequestResponse = {
  requestId: string;
  status: 'Disapproved';
  managerNotes: string;
  approverNotes: string;
  approverBy: string;
  approverByName: string;
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
  approverBy: string;
  approverByName: string;
};

export type AdminUser = AuthenticatedUser & {
  id?: string;
};

export type AdminUserInput = {
  id?: string;
  email: string;
  password?: string;
  role: string;
  fullname: string;
  position: string;
  branchid: string;
  firstLogin: boolean;
  status: string;
  isNew?: boolean;
};

export type ListUsersResponse = {
  users: AdminUser[];
  sheetConfigured: boolean;
  pagination?: PaginationInfo;
};

export type SaveUserResponse = {
  success: boolean;
  message?: string;
  user?: AdminUser;
};

export type ImportUserError = {
  row?: number;
  email?: string;
  message: string;
};

export type ImportUsersResponse = {
  created: number;
  updated: number;
  failed: number;
  errors?: ImportUserError[];
};

export type AppSettings = {
  approverSignature?: string;
};

export type UpdateSettingsResponse = AppSettings & {
  success: boolean;
  message?: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: unknown;
};

type RawRecord = Record<string, any>;

const API_BASE_URL = laravelApiConfig.apiUrl.replace(/\/+$/, '');
let authToken: string | null = localStorage.getItem('auth_token');
let loanTypeCache: LoanType[] | null = null;
let branchCache: Branch[] | null = null;

export class LaravelConfigurationError extends Error {
  constructor() {
    super('Laravel API URL is not configured.');
    this.name = 'LaravelConfigurationError';
  }
}

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: unknown,
): Promise<ApiEnvelope<T>> {
  if (!API_BASE_URL) {
    throw new LaravelConfigurationError();
  }

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data === undefined ? undefined : JSON.stringify(data),
  });

  const rawText = await response.text();
  const parsed = rawText ? JSON.parse(rawText) : {};
  const envelope = parsed as ApiEnvelope<T>;

  if (!response.ok || envelope.success === false) {
    throw new Error(envelope.message || `Request failed with status ${response.status}.`);
  }

  return envelope;
}

async function apiFormCall<T>(
  endpoint: string,
  data: FormData,
): Promise<ApiEnvelope<T>> {
  if (!API_BASE_URL) {
    throw new LaravelConfigurationError();
  }

  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: data,
  });

  const rawText = await response.text();
  const parsed = rawText ? JSON.parse(rawText) : {};
  const envelope = parsed as ApiEnvelope<T>;

  if (!response.ok || envelope.success === false) {
    throw new Error(envelope.message || `Request failed with status ${response.status}.`);
  }

  return envelope;
}

async function apiBlobCall(endpoint: string): Promise<Blob> {
  if (!API_BASE_URL) {
    throw new LaravelConfigurationError();
  }

  const headers: HeadersInit = {
    Accept: '*/*',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const parsed = await response.json() as ApiEnvelope<unknown>;
      message = parsed.message || message;
    } catch {
      // Successful file responses are blobs; failed responses may not be JSON.
    }

    throw new Error(message);
  }

  return response.blob();
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  return (envelope.data ?? ({} as T)) as T;
}

export async function checkBackendHealth(): Promise<BackendHealth> {
  return unwrap(await apiCall<BackendHealth>('/health'));
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthenticatedUser> {
  const result = unwrap(await apiCall<{ token: string; user: RawRecord }>('/auth/login', 'POST', credentials));

  if (result.token) {
    setAuthToken(result.token);
  }

  return mapUser(result.user);
}

export async function logout() {
  try {
    await apiCall('/auth/logout', 'POST');
  } finally {
    setAuthToken(null);
  }
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  return mapUser(unwrap(await apiCall<RawRecord>('/auth/me')));
}

export async function sendPasswordRecovery(email: string): Promise<PasswordRecoveryResponse> {
  return {
    success: false,
    message: `Password recovery for ${email} is not configured on the Laravel backend. Ask an admin to reset the account password.`,
  };
}

export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const result = await apiCall<{ user?: RawRecord }>('/auth/change-password', 'POST', {
    current_password: payload.currentPassword,
    new_password: payload.newPassword,
    new_password_confirmation: payload.newPassword,
  });
  const data = unwrap(result);

  return {
    success: true,
    message: result.message || 'Password changed successfully.',
    user: data.user ? mapUser(data.user) : undefined,
  };
}

export async function listLoanRequests(
  payload: LoanRequestListPayload,
): Promise<LoanRequestListResponse> {
  const queryString = new URLSearchParams(payload).toString();
  const result = unwrap(
    await apiCall<{ requests: RawRecord[]; sheetConfigured?: boolean }>(
      `/loan-requests?${queryString}`,
    ),
  );

  return {
    requests: (result.requests || []).map(mapLoanRequest),
    sheetConfigured: result.sheetConfigured ?? true,
  };
}

export async function listAuditLogs(page: number = 1, perPage: number = 15): Promise<LoanRequestListResponse> {
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('per_page', String(perPage));
  const suffix = `?${query.toString()}`;

  const result = unwrap(
    await apiCall<{ requests: RawRecord[]; sheetConfigured?: boolean; pagination?: PaginationInfo }>(`/loan-requests/audit${suffix}`),
  );

  return {
    requests: (result.requests || []).map(mapLoanRequest),
    sheetConfigured: result.sheetConfigured ?? true,
    pagination: result.pagination,
  };
}

export async function getLoanRequestDetails(
  payload: GetLoanRequestDetailsPayload,
): Promise<LoanRequestDetails> {
  const result = unwrap(
    await apiCall<RawRecord>(`/loan-requests/${encodeURIComponent(payload.requestId)}`),
  );

  return mapLoanRequestDetails(result);
}

export async function searchMembers(
  payload: SearchMembersPayload,
): Promise<SearchMembersResponse> {
  const result = unwrap(
    await apiCall<{ members: RawRecord[] }>(`/members?search=${encodeURIComponent(payload.query)}`),
  );
  const members = Array.isArray(result.members) ? result.members : [];

  return {
    members: members.map(mapMember),
    sheetConfigured: true,
  };
}

export async function listMembers(
  payload: ListMembersPayload = {},
): Promise<SearchMembersResponse> {
  const query = new URLSearchParams();

  if (payload.query?.trim()) {
    query.set('search', payload.query.trim());
  }

  const perPage = payload.perPage ?? payload.limit;

  if (perPage) {
    query.set('per_page', String(perPage));
  }

  if (payload.page) {
    query.set('page', String(payload.page));
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const result = unwrap(
    await apiCall<{ 
      members: RawRecord[]; 
      sheetConfigured?: boolean;
      pagination?: PaginationInfo;
    }>(`/members${suffix}`),
  );
  const members = Array.isArray(result.members) ? result.members : [];

  return {
    members: members.map(mapMember),
    sheetConfigured: result.sheetConfigured ?? true,
    pagination: result.pagination,
  };
}

export async function saveMember(member: AdminMemberInput): Promise<SaveMemberResponse> {
  const body = toBackendMemberPayload(member);
  const memberId = member.id?.trim();
  const endpoint = memberId
    ? `/members/${encodeURIComponent(memberId)}`
    : '/members';
  const result = await apiCall<RawRecord>(
    endpoint,
    memberId ? 'PUT' : 'POST',
    body,
  );

  return {
    success: true,
    message: result.message || (memberId ? 'Member updated successfully.' : 'Member created successfully.'),
    member: mapMember(unwrap(result)),
  };
}

export async function deleteMember(memberId: string): Promise<SaveMemberResponse> {
  const result = await apiCall<unknown>(
    `/members/${encodeURIComponent(memberId)}`,
    'DELETE',
  );

  return {
    success: true,
    message: result.message || 'Member deleted successfully.',
  };
}

export async function deleteAllMembers(confirmation: string): Promise<BulkDeleteResponse> {
  const result = await apiCall<RawRecord>('/members', 'DELETE', { confirmation });
  const data = unwrap(result);

  return {
    success: true,
    message: result.message || 'All members deleted successfully.',
    deletedCount: toNumber(asString(data.deleted_count)),
  };
}

export async function importMembers(members: AdminMemberInput[]): Promise<ImportMembersResponse> {
  const result = unwrap(
    await apiCall<RawRecord>('/members/import', 'POST', {
      members: members.map(toBackendMemberPayload),
    }),
  );

  const errors = Array.isArray(result.errors)
    ? result.errors.map((error: RawRecord) => ({
        row: toNumber(asString(error.row)),
        cif_key: asString(error.cif_key),
        message: asString(error.message) || 'Import failed.',
      }))
    : [];

  return {
    created: toNumber(asString(result.created)),
    updated: toNumber(asString(result.updated)),
    failed: toNumber(asString(result.failed)),
    errors,
  };
}

export async function getLoanTypes(): Promise<GetLoanTypesResponse> {
  if (loanTypeCache) {
    return { loanTypes: loanTypeCache };
  }

  const result = unwrap(await apiCall<{ loanTypes: RawRecord[] }>('/loan-types'));
  loanTypeCache = (result.loanTypes || []).map(mapLoanType);

  return { loanTypes: loanTypeCache };
}

export async function listAdminLoanTypes(
  page: number = 1,
  perPage: number = 15,
): Promise<GetLoanTypesResponse> {
  const result = unwrap(
    await apiCall<{
      loanTypes: RawRecord[];
      pagination?: PaginationInfo;
    }>(`/admin/loan-types?page=${page}&per_page=${perPage}`),
  );

  return {
    loanTypes: (result.loanTypes || []).map(mapLoanType),
    pagination: result.pagination,
  };
}

export async function saveLoanType(
  loanType: AdminLoanTypeInput,
): Promise<SaveLoanTypeResponse> {
  const body: RawRecord = {
    loan_type_name: loanType.loantype.trim(),
    description: loanType.description.trim() || null,
    minimum_amount: toNullableNumber(loanType.minimumAmount),
    maximum_amount: toNullableNumber(loanType.maximumAmount),
    maximum_term_months: toNullableNumber(loanType.maximumTermMonths),
    interest_rate: toNullableNumber(loanType.interestRate),
    is_active: loanType.isActive,
  };
  const loanTypeId = loanType.loan_id.trim();
  const endpoint = loanTypeId
    ? `/admin/loan-types/${encodeURIComponent(loanTypeId)}`
    : '/admin/loan-types';
  const result = await apiCall<RawRecord>(
    endpoint,
    loanTypeId ? 'PUT' : 'POST',
    body,
  );

  loanTypeCache = null;

  return {
    success: true,
    message:
      result.message ||
      (loanTypeId
        ? 'Loan type updated successfully.'
        : 'Loan type created successfully.'),
    loanType: mapLoanType(unwrap(result)),
  };
}

export async function getBranches(page?: number, perPage?: number): Promise<GetBranchesResponse> {
  const shouldPaginate = page !== undefined || perPage !== undefined;

  if (!shouldPaginate && branchCache) {
    return { branches: branchCache };
  }

  const query = new URLSearchParams();
  if (shouldPaginate) {
    query.set('page', String(page ?? 1));
    query.set('per_page', String(perPage ?? 15));
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';

  const result = unwrap(await apiCall<{ branches: RawRecord[]; pagination?: PaginationInfo }>(`/branches${suffix}`));
  const branches = (result.branches || []).map(mapBranch);

  if (!shouldPaginate) {
    branchCache = branches;
  }

  return { 
    branches,
    pagination: result.pagination,
  };
}

export async function saveBranch(branch: AdminBranchInput): Promise<SaveBranchResponse> {
  const body: RawRecord = {
    branch_code: asString(branch.branch_code).trim(),
    branch_name: asString(branch.branch_name).trim(),
    address: asString(branch.address) || null,
    phone: asString(branch.phone) || null,
  };

  const branchId = branch.id?.trim();
  const endpoint = branchId
    ? `/branches/${encodeURIComponent(branchId)}`
    : '/branches';
  const result = await apiCall<RawRecord>(
    endpoint,
    branchId ? 'PUT' : 'POST',
    body,
  );

  branchCache = null;

  return {
    success: true,
    message: result.message || (branchId ? 'Branch updated successfully.' : 'Branch created successfully.'),
    branch: mapBranch(unwrap(result)),
  };
}

export async function deleteBranch(branchId: string): Promise<SaveBranchResponse> {
  const result = await apiCall<unknown>(
    `/branches/${encodeURIComponent(branchId)}`,
    'DELETE',
  );

  branchCache = null;

  return {
    success: true,
    message: result.message || 'Branch deleted successfully.',
  };
}

export async function deleteAttachment(attachmentId: string): Promise<SaveUserResponse> {
  const result = await apiCall<unknown>(
    `/attachments/${encodeURIComponent(attachmentId)}`,
    'DELETE',
  );

  return {
    success: true,
    message: result.message || 'Attachment deleted successfully.',
  };
}

export async function getAttachmentPreviewBlob(attachmentId: string): Promise<Blob> {
  return apiBlobCall(`/attachments/${encodeURIComponent(attachmentId)}/preview`);
}

export async function getComakerLoans(
  _payload: GetComakerLoansPayload,
): Promise<GetComakerLoansResponse> {
  return { loans: [] };
}

export async function createLoanRequest(
  payload: CreateLoanRequestPayload,
): Promise<CreateLoanRequestResponse> {
  const data = await toBackendLoanRequestPayload(payload);
  const result = unwrap(await apiCall<RawRecord>('/loan-requests', 'POST', data));
  const request = mapLoanRequest(result);

  await syncLoanRequestAttachments(request.requestId, payload);

  return {
    requestId: request.requestId,
    status: request.status,
  };
}

export async function updateLoanRequest(
  payload: CreateLoanRequestPayload,
): Promise<UpdateLoanRequestResponse> {
  const requestId = payload.request.request_id;

  if (!requestId) {
    throw new Error('Request ID is required before updating a loan request.');
  }

  const data = await toBackendLoanRequestPayload(payload);
  const result = unwrap(
    await apiCall<RawRecord>(`/loan-requests/${encodeURIComponent(requestId)}`, 'PUT', {
      ...data,
      status: 'Pending',
    }),
  );
  const request = mapLoanRequest(result);

  await syncLoanRequestAttachments(request.requestId, payload);

  return {
    requestId: request.requestId,
    status: request.status,
  };
}

export async function forwardLoanRequest(
  payload: ForwardLoanRequestPayload,
): Promise<ForwardLoanRequestResponse> {
  const request = await updateLoanRequestStatus(payload.requestId, {
    status: 'Forwarded',
    manager_notes: payload.notes,
  });

  return {
    requestId: request.requestId,
    status: 'Forwarded',
    managerNotes: request.managerNotes,
    managerBy: request.managerBy,
    managerByName: request.managerByName,
  };
}

export async function returnLoanRequest(
  payload: ReturnLoanRequestPayload,
): Promise<ReturnLoanRequestResponse> {
  const request = await updateLoanRequestStatus(payload.requestId, {
    status: 'Returned',
    manager_notes: payload.notes,
  });

  return {
    requestId: request.requestId,
    status: 'Returned',
    managerNotes: request.managerNotes,
  };
}

export async function approveLoanRequest(
  payload: DecideLoanRequestPayload,
): Promise<ApproveLoanRequestResponse> {
  const request = await updateLoanRequestStatus(payload.requestId, {
    status: 'Approved',
    approver_id: payload.approverBy,
    approver_name: payload.approverByName,
    review_and_recommendations: payload.reviewAndRecommendations,
    loan_amount_approved: toNullableNumber(payload.loanAmountApproved),
    additional_requirements: payload.additionalRequirements,
  });

  return {
    requestId: request.requestId,
    status: 'Approved',
    managerNotes: request.managerNotes,
    approverBy: request.approverBy,
    approverByName: request.approverByName,
    reviewAndRecommendations: request.reviewAndRecommendations,
    dateOfApproval: request.dateOfApproval,
    loanAmountApproved: request.loanAmountApproved,
    additionalRequirements: request.additionalRequirements,
  };
}

export async function disapproveLoanRequest(
  payload: DecideLoanRequestPayload,
): Promise<DisapproveLoanRequestResponse> {
  const request = await updateLoanRequestStatus(payload.requestId, {
    status: 'Disapproved',
    approver_id: payload.approverBy,
    approver_name: payload.approverByName,
    review_and_recommendations: payload.reviewAndRecommendations,
    additional_requirements: payload.additionalRequirements,
    approver_notes: payload.notes,
  });

  return {
    requestId: request.requestId,
    status: 'Disapproved',
    managerNotes: request.managerNotes,
    approverNotes: request.approverNotes,
    approverBy: request.approverBy,
    approverByName: request.approverByName,
    reviewAndRecommendations: request.reviewAndRecommendations,
    dateOfApproval: request.dateOfApproval,
    loanAmountApproved: request.loanAmountApproved,
    additionalRequirements: request.additionalRequirements,
  };
}

export async function returnLoanRequestToManager(
  payload: ReturnToManagerPayload,
): Promise<ReturnToManagerResponse> {
  const request = await updateLoanRequestStatus(payload.requestId, {
    status: 'Returned to Manager',
    approver_id: payload.approverBy,
    approver_name: payload.approverByName,
    approver_notes: payload.notes,
  });

  return {
    requestId: request.requestId,
    status: 'Returned to Manager',
    managerNotes: request.managerNotes,
    approverNotes: request.approverNotes,
    approverBy: request.approverBy,
    approverByName: request.approverByName,
  };
}

export async function listUsers(page: number = 1, perPage: number = 15): Promise<ListUsersResponse> {
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('per_page', String(perPage));
  const suffix = `?${query.toString()}`;

  const result = unwrap(
    await apiCall<{ users: RawRecord[]; sheetConfigured?: boolean; pagination?: PaginationInfo }>(`/users${suffix}`),
  );

  return {
    users: (result.users || []).map(mapUser),
    sheetConfigured: result.sheetConfigured ?? true,
    pagination: result.pagination,
  };
}

export async function saveUser(user: AdminUserInput): Promise<SaveUserResponse> {
  const body = toBackendUserPayload(user);

  if (user.isNew) {
    const result = await apiCall<RawRecord>('/users', 'POST', body);

    return {
      success: true,
      message: result.message || 'User created successfully.',
      user: mapUser(unwrap(result)),
    };
  }

  const userId = user.id?.trim();
  const existingId = userId || (await findUserIdByEmail(user.email));

  if (!existingId) {
    throw new Error('Unable to find the selected user ID.');
  }

  const result = await apiCall<RawRecord>(
    `/users/${encodeURIComponent(existingId)}`,
    'PUT',
    body,
  );

  return {
    success: true,
    message: result.message || 'User updated successfully.',
    user: mapUser(unwrap(result)),
  };
}

async function findUserIdByEmail(email: string): Promise<string | undefined> {
  const targetEmail = email.toLowerCase();
  let page = 1;

  while (page <= 100) {
    const result = await listUsers(page, 100);
    const user = result.users.find(
      (candidate) => candidate.email.toLowerCase() === targetEmail,
    );

    if (user?.id) {
      return user.id;
    }

    if (!result.pagination?.has_more) {
      return undefined;
    }

    page += 1;
  }

  return undefined;
}

export async function importUsers(users: AdminUserInput[]): Promise<ImportUsersResponse> {
  const result = unwrap(
    await apiCall<RawRecord>('/users/import', 'POST', {
      users: users.map(toBackendUserPayload),
    }),
  );

  const errors = Array.isArray(result.errors)
    ? result.errors.map((error: RawRecord) => ({
        row: toNumber(asString(error.row)),
        email: asString(error.email),
        message: asString(error.message) || 'Import failed.',
      }))
    : [];

  return {
    created: toNumber(asString(result.created)),
    updated: toNumber(asString(result.updated)),
    failed: toNumber(asString(result.failed)),
    errors,
  };
}

export async function deleteAllUsers(confirmation: string): Promise<BulkDeleteResponse> {
  const result = await apiCall<RawRecord>('/users', 'DELETE', { confirmation });
  const data = unwrap(result);

  return {
    success: true,
    message: result.message || 'All users deleted successfully.',
    deletedCount: toNumber(asString(data.deleted_count)),
  };
}

export async function getSettings(): Promise<AppSettings> {
  return unwrap(await apiCall<AppSettings>('/settings'));
}

export async function updateSettings(settings: AppSettings): Promise<UpdateSettingsResponse> {
  const result = await apiCall<AppSettings>('/settings', 'PUT', settings);
  const data = unwrap(result);

  return {
    ...data,
    approverSignature: data.approverSignature ?? settings.approverSignature,
    success: true,
    message: result.message || 'Settings saved.',
  };
}

export function getAuthToken() {
  return authToken;
}

export function setAuthToken(token: string | null) {
  authToken = token;

  if (token) {
    localStorage.setItem('auth_token', token);
    return;
  }

  localStorage.removeItem('auth_token');
}

export function isAuthenticated() {
  return !!authToken;
}

async function updateLoanRequestStatus(requestId: string, data: RawRecord) {
  const result = unwrap(
    await apiCall<RawRecord>(`/loan-requests/${encodeURIComponent(requestId)}`, 'PUT', data),
  );

  return mapLoanRequest(result);
}

async function toBackendLoanRequestPayload(payload: CreateLoanRequestPayload) {
  const request = payload.request;

  return {
    cif_key: request.cif_key.trim(),
    loan_type_id: await resolveLoanTypeId(request.loan_type),
    branch_id: toNullableNumber(payload.branchid) ?? 1,
    amount_applied: toNumber(request.amount_applied),
    request_date: request.request_date || undefined,
    loan_balance: toNumber(request.loan_balance),
    share_capital: toNullableNumber(request.share_capital),
    date_of_retirement: request.date_of_retirement || null,
    employer: request.employer || null,
    position: request.position || null,
    employers_address: request.employers_address || null,
    monthly_pension: toNumber(request.monthly_pension),
    current_nthp: toNumber(request.current_nthp),
    analysis_nthp: request.analysis_nthp.trim() || null,
    appraisal_result: request.appraisal_result || null,
    recommendation: request.recommendation || null,
    other_loans: payload.otherLoans.map((loan) => ({
      loan_type: loan.loan_type,
      loan_amount: toNumber(loan.loan_amount),
      balance: toNumber(loan.balance),
      status: loan.status,
      analysis: loan.analysis,
    })),
    comakers: payload.comakers.map((comaker) => ({
      comaker_fullname: comaker.fullname,
      loan_type: comaker.loan_type,
      loan_amount: toNullableNumber(comaker.loan_amount),
      loan_balance: toNullableNumber(comaker.loan_balance),
      status: comaker.status,
    })),
    securities: payload.securities.map((security) => ({
      nature: security.nature,
      market_value: toNullableNumber(security.market_value),
      appraised_value: toNullableNumber(security.appraised_value),
    })),
  };
}

async function syncLoanRequestAttachments(
  requestId: string,
  payload: CreateLoanRequestPayload,
) {
  const updates = payload.attachmentUpdates || [];

  await Promise.all(
    updates.map((attachment) =>
      apiCall<RawRecord>(
        `/attachments/${encodeURIComponent(attachment.id)}`,
        'PUT',
        { attachment_type: attachment.attachmentType },
      ),
    ),
  );

  const uploads = (payload.attachmentUploads || []).filter(
    (attachment) => attachment.file && attachment.attachmentType,
  );

  if (!uploads.length) {
    return [];
  }

  const formData = new FormData();

  uploads.forEach((attachment) => {
    formData.append('attachments[]', attachment.file);
    formData.append('attachment_types[]', attachment.attachmentType);
  });

  const result = unwrap(
    await apiFormCall<{ attachments: RawRecord[] }>(
      `/loan-requests/${encodeURIComponent(requestId)}/attachments`,
      formData,
    ),
  );

  return (result.attachments || []).map(mapAttachment);
}

async function resolveLoanTypeId(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error('Loan type is required.');
  }

  const numericId = Number(trimmed);

  if (Number.isInteger(numericId) && numericId > 0) {
    return numericId;
  }

  const { loanTypes } = await getLoanTypes();
  const match = loanTypes.find(
    (loanType) => loanType.loantype.toLowerCase() === trimmed.toLowerCase(),
  );

  if (!match) {
    throw new Error(`Loan type "${trimmed}" was not found in MySQL.`);
  }

  return Number(match.loan_id);
}

function mapLoanRequest(raw: RawRecord): LoanRequest {
  const member = raw.member || {};
  const loanType = raw.loan_type || raw.loanType || {};
  const branch = raw.branch || {};
  const requestedBy = raw.requested_by || raw.requestedBy || {};
  const manager = raw.manager || {};
  const approver = raw.approver || {};

  return {
    requestId: asString(raw.request_id || raw.id),
    memberName: asString(member.fullname || member.client_name || raw.member_name),
    loanType: asString(loanType.loan_type_name || raw.loan_type_name),
    amount: asString(raw.amount_applied),
    status: asString(raw.status || 'Pending'),
    requestedAt: asString(raw.request_date),
    decidedAt: asString(raw.date_of_approval),
    requestedBy: asString(requestedBy.email || raw.requested_by),
    requestedByName: asString(requestedBy.fullname),
    branchid: asString(raw.branch_id),
    branchName: asString(branch.branch_name),
    remarks: asString(raw.recommendation),
    managerNotes: asString(raw.manager_notes),
    approverNotes: asString(raw.approver_notes),
    managerBy: asString(manager.email),
    managerByName: asString(manager.fullname),
    approverBy: asString(approver.email),
    approverByName: asString(approver.fullname),
    reviewAndRecommendations: asString(raw.review_and_recommendations),
    dateOfApproval: toDateTimeDisplayValue(asString(raw.date_of_approval)),
    loanAmountApproved: asString(raw.loan_amount_approved),
    additionalRequirements: asString(raw.additional_requirements),
  };
}

function mapLoanRequestDetails(raw: RawRecord): LoanRequestDetails {
  const summary = mapLoanRequest(raw);
  const member = raw.member || {};
  const loanType = raw.loan_type || raw.loanType || {};
  const otherLoans = (raw.other_loans || raw.otherLoans || []).map(mapOtherLoan);
  const comakers = (raw.comakers || []).map(mapComaker);
  const securities = (raw.securities || []).map(mapSecurity);
  const attachments = (raw.attachments || []).map(mapAttachment);

  return {
    status: summary.status,
    request: {
      request_id: summary.requestId,
      request_date: toDateInputValue(asString(raw.request_date)),
      cif_key: asString(member.cif_key),
      fullname: asString(member.fullname || member.client_name),
      address: asString(member.address),
      age: asString(member.age),
      share_capital: asString(member.share_capital),
      date_of_retirement: toDateInputValue(asString(member.date_of_retirement)),
      loan_type: asString(loanType.loan_type_name),
      amount_applied: asString(raw.amount_applied),
      loan_balance: asString(raw.loan_balance),
      other_loans: String(otherLoans.length),
      employer: asString(raw.employer),
      position: asString(raw.position),
      employers_address: asString(raw.employers_address),
      monthly_pension: asString(raw.monthly_pension),
      current_nthp: asString(raw.current_nthp),
      analysis_nthp: asString(raw.analysis_nthp),
      comaker1: asString(comakers[0]?.fullname),
      comaker2: asString(comakers[1]?.fullname),
      comaker3: asString(comakers[2]?.fullname),
      comaker4: asString(comakers[3]?.fullname),
      appraisal_result: asString(raw.appraisal_result),
      recommendation: asString(raw.recommendation),
    },
    otherLoans,
    comakers,
    securities,
    attachments,
    requestedBy: summary.requestedBy,
    requestedByName: summary.requestedByName,
    branchid: summary.branchid,
    branchName: summary.branchName,
    managerBy: summary.managerBy,
    managerByName: summary.managerByName,
    approverBy: summary.approverBy,
    approverByName: summary.approverByName,
    managerNotes: summary.managerNotes,
    approverNotes: summary.approverNotes,
    reviewAndRecommendations: summary.reviewAndRecommendations,
    dateOfApproval: summary.dateOfApproval,
    loanAmountApproved: summary.loanAmountApproved,
    additionalRequirements: summary.additionalRequirements,
  };
}

function mapMember(raw: RawRecord): Member {
  const branch = raw.branch || {};

  return {
    id: asString(raw.id),
    cif_key: asString(raw.cif_key),
    client_name: asString(raw.fullname || raw.client_name),
    membership_date: toDateInputValue(asString(raw.membership_date)),
    membership_type: asString(raw.member_type || raw.membership_type),
    sex: asString(raw.sex),
    age: asString(raw.age),
    birthdate: toDateInputValue(asString(raw.birth_date || raw.birthdate)),
    contactnumber: asString(raw.contact || raw.contactnumber),
    address: asString(raw.address),
    share_capital: asString(raw.share_capital),
    date_of_retirement: toDateInputValue(asString(raw.date_of_retirement)),
    branch_id: asString(raw.branch_id || raw.branchid || branch.id),
    branch_name: asString(raw.branch_name || branch.branch_name),
    status: normalizeMemberStatus(raw.status),
    tin_number: asString(raw.tin || raw.tin_number),
    occupation: asString(raw.occupation),
    educational_attainment: asString(raw.educational_attainment),
  };
}

function mapLoanType(raw: RawRecord): LoanType {
  return {
    loan_id: asString(raw.id || raw.loan_id),
    loantype: asString(raw.loan_type_name || raw.loantype),
    description: asString(raw.description),
    minimumAmount: asString(raw.minimum_amount),
    maximumAmount: asString(raw.maximum_amount),
    maximumTermMonths: asString(raw.maximum_term_months),
    interestRate: asString(raw.interest_rate),
    isActive:
      raw.is_active === undefined
        ? true
        : Boolean(
            raw.is_active === true ||
              raw.is_active === 1 ||
              raw.is_active === '1',
          ),
  };
}

function mapBranch(raw: RawRecord): Branch {
  return {
    id: asString(raw.id),
    branch_code: asString(raw.branch_code),
    branch_name: asString(raw.branch_name),
    address: asString(raw.address),
    phone: asString(raw.phone),
  };
}

function toBackendMemberPayload(member: Partial<Member>): RawRecord {
  return {
    cif_key: asString(member.cif_key).trim(),
    client_name: asString(member.client_name).trim(),
    membership_date: asString(member.membership_date) || null,
    membership_type: asString(member.membership_type) || null,
    sex: asString(member.sex) || null,
    age: toNullableNumber(asString(member.age)),
    birthdate: asString(member.birthdate) || null,
    contactnumber: asString(member.contactnumber) || null,
    address: asString(member.address) || null,
    share_capital: toNullableNumber(asString(member.share_capital)),
    date_of_retirement: asString(member.date_of_retirement) || null,
    branch_id: asString(member.branch_id) || null,
    status: normalizeMemberStatus(member.status),
    tin_number: asString(member.tin_number) || null,
    occupation: asString(member.occupation) || null,
    educational_attainment: asString(member.educational_attainment) || null,
  };
}

function toBackendUserPayload(user: AdminUserInput): RawRecord {
  const body: RawRecord = {
    email: asString(user.email).trim(),
    role: user.role === 'branch_manager' ? 'manager' : asString(user.role).trim(),
    fullname: asString(user.fullname).trim(),
    position: asString(user.position).trim() || null,
    branch_id: asString(user.branchid).trim() || null,
    first_login: user.firstLogin,
    status: normalizeUserStatus(user.status),
  };

  if (user.password?.trim()) {
    body.password = user.password.trim();
  }

  return body;
}

function mapUser(raw: RawRecord): AdminUser {
  const branch = raw.branch || {};

  return {
    id: asString(raw.id),
    email: asString(raw.email),
    role: asString(raw.role),
    fullname: asString(raw.fullname),
    position: asString(raw.position),
    branchid: asString(raw.branchid || raw.branch_id),
    branchName: asString(raw.branchName || branch.branch_name),
    firstLogin: Boolean(raw.firstLogin ?? raw.first_login),
    status: normalizeUserStatus(raw.status),
  };
}

function mapOtherLoan(raw: RawRecord): NewOtherLoan {
  return {
    loan_type: asString(raw.loan_type),
    loan_amount: asString(raw.loan_amount),
    balance: asString(raw.balance),
    status: asString(raw.status),
    analysis: asString(raw.analysis),
  };
}

function mapComaker(raw: RawRecord): NewComaker {
  return {
    fullname: asString(raw.comaker_fullname || raw.fullname),
    loan_type: asString(raw.loan_type),
    loan_amount: asString(raw.loan_amount),
    loan_balance: asString(raw.loan_balance),
    status: asString(raw.status),
  };
}

function mapSecurity(raw: RawRecord): NewSecurity {
  return {
    nature: asString(raw.nature),
    market_value: asString(raw.market_value),
    appraised_value: asString(raw.appraised_value),
  };
}

function mapAttachment(raw: RawRecord): LoanAttachment {
  return {
    id: asString(raw.id),
    loanRequestId: asString(raw.loan_request_id || raw.loanRequestId),
    attachmentType: asString(raw.attachment_type || raw.attachmentType),
    originalFilename: asString(raw.original_filename || raw.originalFilename),
    mimeType: asString(raw.mime_type || raw.mimeType),
    size: asString(raw.size),
    uploadedAt: asString(raw.created_at || raw.uploadedAt),
  };
}

function asString(value: unknown) {
  return value === null || typeof value === 'undefined' ? '' : String(value);
}

function toNumber(value: string | undefined) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function toNullableNumber(value: string | undefined) {
  if (!value || !value.trim()) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeMemberStatus(value: unknown) {
  const normalized = asString(value).trim().toUpperCase();

  if (normalized === 'INACTIVE' || normalized === 'I') {
    return 'INACTIVE';
  }

  return 'ACTIVE';
}

function normalizeUserStatus(value: unknown) {
  const normalized = asString(value).trim().toUpperCase();

  return normalized === 'INACTIVE' || normalized === 'I' ? 'INACTIVE' : 'ACTIVE';
}

function toDateTimeDisplayValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  return formatDateTimeParts(parsed);
}

function formatDateTimeParts(value: Date) {
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  const year = value.getFullYear();
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  const seconds = String(value.getSeconds()).padStart(2, '0');

  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}

function toDateInputValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${parsed.getFullYear()}-${month}-${day}`;
}
