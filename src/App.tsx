import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Edit,
  Eye,
  EyeOff,
  History,
  Inbox,
  LayoutDashboard,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  UserCheck,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  AppsScriptConfigurationError,
  type AppsScriptConnectionState,
  type AuthenticatedUser,
  type BackendHealth,
  type ComakerLoan,
  type GetComakerLoansPayload,
  type LoanRequest,
  type LoanRequestDetails,
  type LoanRequestListPayload,
  type LoanType,
  type Member,
  type NewComaker,
  type NewLoanRequest,
  type NewOtherLoan,
  type NewSecurity,
  approveLoanRequest,
  checkBackendHealth,
  createLoanRequest,
  disapproveLoanRequest,
  forwardLoanRequest,
  getLoanRequestDetails,
  getComakerLoans,
  getLoanTypes,
  listLoanRequests,
  loginUser,
  returnLoanRequest,
  returnLoanRequestToManager,
  searchMembers,
  updateLoanRequest,
} from './services/appsScriptClient';
import {
  googleAppsScriptConfig,
  hasGoogleAppsScriptUrl,
} from './config/googleAppsScript';

type StatusCopy = {
  label: string;
  detail: string;
};

type BackendRow = [label: string, value: string];
type DashboardKind = 'teller' | 'manager' | 'approver';
type PageKind = 'login' | DashboardKind;
type DashboardView = LoanRequestListPayload['view'];

type DashboardMenu = {
  id: DashboardView;
  label: string;
  description: string;
  icon: LucideIcon;
};

type DashboardConfig = {
  title: string;
  eyebrow: string;
  landingPath: string;
  menus: DashboardMenu[];
};

type LoginPageProps = {
  activeStatus: StatusCopy;
  backendRows: BackendRow[];
  connectionState: AppsScriptConnectionState;
  errorMessage: string;
  onHealthCheck: () => void;
  onLoginSuccess: (user: AuthenticatedUser) => void;
};

type DashboardProps = {
  activeStatus: StatusCopy;
  backendRows: BackendRow[];
  connectionState: AppsScriptConnectionState;
  dashboard: DashboardKind;
  errorMessage: string;
  onHealthCheck: () => void;
  onLogout: () => void;
  user: AuthenticatedUser;
};

const SESSION_STORAGE_KEY = 'members-loan-approval-user';

const statusCopy: Record<AppsScriptConnectionState, StatusCopy> = {
  'not-configured': {
    label: 'Needs Web App URL',
    detail: 'Apps Script ID is saved. Deployment URL is still blank.',
  },
  checking: {
    label: 'Checking',
    detail: 'Testing the Google Apps Script health route.',
  },
  connected: {
    label: 'Connected',
    detail: 'The Apps Script backend is responding.',
  },
  failed: {
    label: 'Connection Failed',
    detail: 'The backend could not be reached.',
  },
};

const dashboardConfigs: Record<DashboardKind, DashboardConfig> = {
  teller: {
    title: 'Teller Dashboard',
    eyebrow: 'Teller Workspace',
    landingPath: '/teller.html',
    menus: [
      {
        id: 'pending',
        label: 'My Request',
        description: 'Pending requests',
        icon: Inbox,
      },
      {
        id: 'history',
        label: 'Request History',
        description: 'Approved and disapproved',
        icon: History,
      },
    ],
  },
  manager: {
    title: 'Branch Manager Dashboard',
    eyebrow: 'Branch Review',
    landingPath: '/manager.html',
    menus: [
      {
        id: 'pending',
        label: 'Branch Requests',
        description: 'Pending branch requests',
        icon: Building2,
      },
      {
        id: 'history',
        label: 'Decision History',
        description: 'Approved and disapproved',
        icon: History,
      },
    ],
  },
  approver: {
    title: 'Savings and Credit Head Dashboard',
    eyebrow: 'Final Approval',
    landingPath: '/approver.html',
    menus: [
      {
        id: 'pending',
        label: 'For Approval',
        description: 'Pending final review',
        icon: UserCheck,
      },
      {
        id: 'history',
        label: 'Approval History',
        description: 'Approved and disapproved',
        icon: History,
      },
    ],
  },
};

const requestFields: Array<{
  name: keyof NewLoanRequest;
  label: string;
  type?: string;
  span?: 'full';
}> = [
  { name: 'request_date', label: 'Request Date', type: 'date' },
  { name: 'cif_key', label: 'CIF Key' },
  { name: 'fullname', label: 'Full Name' },
  { name: 'age', label: 'Age', type: 'number' },
  { name: 'address', label: 'Address', span: 'full' },
  { name: 'share_capital', label: 'Share Capital', type: 'number' },
  { name: 'date_of_retirement', label: 'Date of Retirement', type: 'date' },
  { name: 'loan_type', label: 'Loan Type' },
  { name: 'amount_applied', label: 'Amount Applied', type: 'number' },
  { name: 'loan_balance', label: 'Loan Balance', type: 'number' },
  { name: 'employer', label: 'Employer' },
  { name: 'position', label: 'Position' },
  { name: 'employers_address', label: "Employer's Address", span: 'full' },
  { name: 'monthly_pension', label: 'Monthly Pension', type: 'number' },
  { name: 'current_nthp', label: 'Current NTHP', type: 'number' },
  { name: 'analysis_nthp', label: 'Analysis NTHP', type: 'number' },
  { name: 'appraisal_result', label: 'Appraisal Result', span: 'full' },
  { name: 'recommendation', label: 'Recommendation', span: 'full' },
];

const otherLoanFields: Array<{
  name: keyof NewOtherLoan;
  label: string;
  type?: string;
}> = [
  { name: 'loan_type', label: 'Loan Type' },
  { name: 'loan_amount', label: 'Loan Amount', type: 'number' },
  { name: 'balance', label: 'Balance', type: 'number' },
  { name: 'status', label: 'Status' },
  { name: 'analysis', label: 'Analysis' },
];

const comakerFields: Array<{
  name: keyof NewComaker;
  label: string;
  type?: string;
}> = [
  { name: 'fullname', label: 'Full Name' },
  { name: 'loan_type', label: 'Loan Type' },
  { name: 'loan_amount', label: 'Loan Amount', type: 'number' },
  { name: 'loan_balance', label: 'Loan Balance', type: 'number' },
  { name: 'status', label: 'Status' },
];

const securityFields: Array<{
  name: keyof NewSecurity;
  label: string;
  type?: string;
}> = [
  { name: 'nature', label: 'Nature of Security' },
  { name: 'market_value', label: 'Market Value', type: 'number' },
  { name: 'appraised_value', label: 'Appraised Value', type: 'number' },
];

function App() {
  const pageKind = useMemo(() => getCurrentPageKind(), []);
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() =>
    loadStoredUser(),
  );
  const [connectionState, setConnectionState] =
    useState<AppsScriptConnectionState>(
      hasGoogleAppsScriptUrl ? 'checking' : 'not-configured',
    );
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const activeStatus = statusCopy[connectionState];

  const runHealthCheck = useCallback(async () => {
    setHealth(null);
    setErrorMessage('');

    if (!hasGoogleAppsScriptUrl) {
      setConnectionState('not-configured');
      return;
    }

    try {
      setConnectionState('checking');
      const result = await checkBackendHealth();
      setHealth(result);
      setConnectionState('connected');
    } catch (error) {
      setConnectionState('failed');
      setErrorMessage(getErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    void runHealthCheck();
  }, [runHealthCheck]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (pageKind === 'login' || pageKind !== getDashboardForUser(currentUser)) {
      redirectToUserDashboard(currentUser, 'replace');
    }
  }, [currentUser, pageKind]);

  const backendRows = useMemo<BackendRow[]>(
    () => [
      ['Apps Script ID', googleAppsScriptConfig.scriptId],
      [
        'Web App URL',
        hasGoogleAppsScriptUrl ? googleAppsScriptConfig.webAppUrl : 'Not set',
      ],
      ['Backend App', health?.appName || "Member's Loan Approval"],
      ['Spreadsheet', health?.spreadsheetName || 'Pending'],
      [
        'Users Sheet',
        health
          ? health.usersSheetConfigured
            ? 'Ready'
            : 'Missing'
          : 'Pending',
      ],
      [
        'Requests Sheet',
        health
          ? health.requestsSheetConfigured
            ? 'Ready'
            : 'Missing'
          : 'Pending',
      ],
      [
        'Other Loans',
        health
          ? health.otherLoansSheetConfigured
            ? 'Ready'
            : 'Missing'
          : 'Pending',
      ],
      [
        'Comakers',
        health
          ? health.comakersSheetConfigured
            ? 'Ready'
            : 'Missing'
          : 'Pending',
      ],
    ],
    [health],
  );

  const handleLoginSuccess = (user: AuthenticatedUser) => {
    saveStoredUser(user);
    redirectToUserDashboard(user, 'assign');
    setCurrentUser(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentUser(null);

    if (pageKind !== 'login') {
      window.location.assign('/');
    }
  };

  if (!currentUser) {
    return (
      <LoginPage
        activeStatus={activeStatus}
        backendRows={backendRows}
        connectionState={connectionState}
        errorMessage={errorMessage}
        onHealthCheck={runHealthCheck}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const dashboard =
    pageKind === 'login' ? getDashboardForUser(currentUser) : pageKind;

  return (
    <Dashboard
      activeStatus={activeStatus}
      backendRows={backendRows}
      connectionState={connectionState}
      dashboard={dashboard}
      errorMessage={errorMessage}
      onHealthCheck={runHealthCheck}
      onLogout={handleLogout}
      user={currentUser}
    />
  );
}

function LoginPage({
  activeStatus,
  backendRows,
  connectionState,
  errorMessage,
  onHealthCheck,
  onLoginSuccess,
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const user = await loginUser({
        email: email.trim(),
        password,
      });
      onLoginSuccess(user);
    } catch (error) {
      setLoginError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-intro" aria-labelledby="login-app-title">
        <div className="brand-mark">
          <ShieldCheck size={30} aria-hidden="true" />
        </div>
        <p className="eyebrow">Barbaza MPC</p>
        <h1 id="login-app-title">Member&apos;s Loan Approval</h1>
        <p className="login-copy">Sign in with your registered account.</p>

        <ConnectionNotice
          activeStatus={activeStatus}
          connectionState={connectionState}
          compact
        />

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <button
          className="secondary-button inline-button"
          type="button"
          onClick={onHealthCheck}
          disabled={connectionState === 'checking'}
        >
          <RefreshCw size={17} aria-hidden="true" />
          Test Connection
        </button>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Secure Access</p>
            <h2 id="login-title">User Login</h2>
          </div>
          <LockKeyhole size={24} aria-hidden="true" />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <div className="input-shell">
            <Mail size={18} aria-hidden="true" />
            <input
              autoComplete="email"
              id="email"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              type="email"
              value={email}
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-shell">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              className="icon-button"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>

          {loginError ? <p className="error-text">{loginError}</p> : null}

          <button
            className="primary-button"
            type="submit"
            disabled={!canSubmit}
          >
            <LogIn size={18} aria-hidden="true" />
            {isSubmitting ? 'Signing In' : 'Sign In'}
          </button>
        </form>

        <dl className="backend-list compact-list">
          {backendRows.slice(0, 2).map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}

function Dashboard({
  activeStatus,
  backendRows,
  connectionState,
  dashboard,
  errorMessage,
  onHealthCheck,
  onLogout,
  user,
}: DashboardProps) {
  const config = dashboardConfigs[dashboard];
  const [activeView, setActiveView] = useState<DashboardView>(
    config.menus[0].id,
  );
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [viewedRequest, setViewedRequest] = useState<LoanRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<LoanRequest | null>(null);
  const [requestAction, setRequestAction] = useState<{
    requestId: string;
    type: 'forward' | 'return' | 'approve' | 'disapprove' | 'return-manager';
  } | null>(null);
  const [requestActionError, setRequestActionError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);
  const { isLoading, requestError, requests, sheetConfigured } =
    useLoanRequests(user, dashboard, activeView, refreshToken);

  useEffect(() => {
    setActiveView(config.menus[0].id);
  }, [config.menus]);

  const activeMenu =
    config.menus.find((menu) => menu.id === activeView) || config.menus[0];
  const summaryCards = getSummaryCards({
    activeMenu,
    dashboard,
    requests,
    sheetConfigured,
    user,
  });
  const isTellerDashboard = dashboard === 'teller';

  const handleRequestCreated = () => {
    setShowRequestForm(false);
    setEditingRequest(null);
    setActiveView('pending');
    setRefreshToken((value) => value + 1);
  };

  const handleForwardForApproval = async (request: LoanRequest, notes: string) => {
    setRequestActionError('');

    if (!request.requestId) {
      setRequestActionError('Unable to forward request: request ID is missing.');
      return;
    }

    setRequestAction({
      requestId: request.requestId,
      type: 'forward',
    });

    try {
      await forwardLoanRequest({
        managerBy: user.email,
        managerByName: user.fullname,
        requestId: request.requestId,
        notes,
      });
      setViewedRequest(null);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setRequestActionError(getErrorMessage(error));
    } finally {
      setRequestAction(null);
    }
  };

  const handleReturnToTeller = async (request: LoanRequest, notes: string) => {
    setRequestActionError('');

    if (!request.requestId) {
      setRequestActionError('Unable to return request: request ID is missing.');
      return;
    }

    if (!notes.trim()) {
      setRequestActionError('Notes are required before returning a request.');
      return;
    }

    setRequestAction({
      requestId: request.requestId,
      type: 'return',
    });

    try {
      await returnLoanRequest({
        requestId: request.requestId,
        notes,
      });
      setViewedRequest(null);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setRequestActionError(getErrorMessage(error));
    } finally {
      setRequestAction(null);
    }
  };

  const handleApproveRequest = async (
    request: LoanRequest,
    reviewAndRecommendations?: string,
    dateOfApproval?: string,
    loanAmountApproved?: string,
    additionalRequirements?: string
  ) => {
    setRequestActionError('');

    if (!request.requestId) {
      setRequestActionError('Unable to approve request: request ID is missing.');
      return;
    }

    setRequestAction({
      requestId: request.requestId,
      type: 'approve',
    });

    try {
      await approveLoanRequest({
        requestId: request.requestId,
        reviewAndRecommendations,
        dateOfApproval,
        loanAmountApproved,
        additionalRequirements,
      });
      setViewedRequest(null);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setRequestActionError(getErrorMessage(error));
    } finally {
      setRequestAction(null);
    }
  };

  const handleDisapproveRequest = async (
    request: LoanRequest,
    reviewAndRecommendations?: string,
    additionalRequirements?: string
  ) => {
    setRequestActionError('');

    if (!request.requestId) {
      setRequestActionError('Unable to disapprove request: request ID is missing.');
      return;
    }

    setRequestAction({
      requestId: request.requestId,
      type: 'disapprove',
    });

    try {
      await disapproveLoanRequest({
        requestId: request.requestId,
        reviewAndRecommendations,
        additionalRequirements,
      });
      setViewedRequest(null);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setRequestActionError(getErrorMessage(error));
    } finally {
      setRequestAction(null);
    }
  };

  const handleReturnToManager = async (request: LoanRequest, notes: string) => {
    setRequestActionError('');

    if (!request.requestId) {
      setRequestActionError('Unable to return request: request ID is missing.');
      return;
    }

    if (!notes.trim()) {
      setRequestActionError('Notes are required before returning a request.');
      return;
    }

    setRequestAction({
      requestId: request.requestId,
      type: 'return-manager',
    });

    try {
      await returnLoanRequestToManager({
        requestId: request.requestId,
        notes,
      });
      setViewedRequest(null);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setRequestActionError(getErrorMessage(error));
    } finally {
      setRequestAction(null);
    }
  };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark sidebar-mark">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">Member&apos;s Loan</p>
            <strong>Approval</strong>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label={`${config.title} menu`}>
          {config.menus.map((menu) => {
            const Icon = menu.icon;
            const isActive = menu.id === activeView;

            return (
              <button
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                key={menu.id}
                type="button"
                onClick={() => setActiveView(menu.id)}
              >
                <Icon size={19} aria-hidden="true" />
                <span>
                  <strong>{menu.label}</strong>
                  <small>{menu.description}</small>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <ConnectionNotice
            activeStatus={activeStatus}
            connectionState={connectionState}
            compact
          />
          <button
            className="secondary-button"
            type="button"
            onClick={onHealthCheck}
            disabled={connectionState === 'checking'}
          >
            <RefreshCw size={17} aria-hidden="true" />
            Test Connection
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">{config.eyebrow}</p>
            <h1>{config.title}</h1>
          </div>
          <div className="topbar-actions">
            <div className="profile-chip">
              <span>{user.fullname || user.email}</span>
              <small>{user.role || user.position || 'User'}</small>
            </div>
            <div className={`status-pill ${connectionState}`}>
              <span />
              {activeStatus.label}
            </div>
            <button className="icon-action" type="button" onClick={onLogout}>
              <LogOut size={18} aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </header>

        {user.firstLogin ? (
          <p className="notice-text dashboard-notice">
            This account is marked for first login.
          </p>
        ) : null}

        {errorMessage ? (
          <p className="error-text dashboard-notice">{errorMessage}</p>
        ) : null}

        <section className="dashboard-stats" aria-label="Dashboard summary">
          {summaryCards.map(({ icon: Icon, label, value }) => (
            <article className="stat-card" key={label}>
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="requests-panel" aria-labelledby="requests-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{activeMenu.description}</p>
              <h2 id="requests-title">{activeMenu.label}</h2>
            </div>
            <div className="panel-actions">
              {isTellerDashboard ? (
                <button
                  className="secondary-button inline-button"
                  type="button"
                  onClick={() => {
                    setEditingRequest(null);
                    setShowRequestForm((value) => !value);
                  }}
                >
                  {showRequestForm ? (
                    <X size={17} aria-hidden="true" />
                  ) : (
                    <Plus size={17} aria-hidden="true" />
                  )}
                  {showRequestForm ? 'Close' : 'New Request'}
                </button>
              ) : null}
              <span className="count-chip">
                {isLoading ? 'Loading' : `${requests.length} records`}
              </span>
            </div>
          </div>

          {requestError ? <p className="error-text">{requestError}</p> : null}

          {showRequestForm && isTellerDashboard ? (
            <NewRequestForm
              editingRequest={editingRequest}
              onCancel={() => {
                setShowRequestForm(false);
                setEditingRequest(null);
              }}
              onCreated={handleRequestCreated}
              user={user}
            />
          ) : null}

          <RequestTable
            isLoading={isLoading}
            requests={requests}
            sheetConfigured={sheetConfigured}
            onViewRequest={setViewedRequest}
          />
        </section>

        {viewedRequest ? (
          <RequestDetailPanel
            dashboard={dashboard}
            errorMessage={requestActionError}
            isForwarding={
              requestAction?.requestId === viewedRequest.requestId &&
              requestAction.type === 'forward'
            }
            isReturning={
              requestAction?.requestId === viewedRequest.requestId &&
              requestAction.type === 'return'
            }
            isApproving={
              requestAction?.requestId === viewedRequest.requestId &&
              requestAction.type === 'approve'
            }
            isDisapproving={
              requestAction?.requestId === viewedRequest.requestId &&
              requestAction.type === 'disapprove'
            }
            isReturningToManager={
              requestAction?.requestId === viewedRequest.requestId &&
              requestAction.type === 'return-manager'
            }
            request={viewedRequest}
            onClose={() => {
              setRequestActionError('');
              setViewedRequest(null);
            }}
            onEdit={() => {
              setEditingRequest(viewedRequest);
              setShowRequestForm(true);
              setRequestActionError('');
              setViewedRequest(null);
            }}
            onForward={(notes) =>
              void handleForwardForApproval(viewedRequest, notes)
            }
            onReturn={(notes) => void handleReturnToTeller(viewedRequest, notes)}
            onApprove={(reviewAndRecommendations, dateOfApproval, loanAmountApproved, additionalRequirements) =>
              void handleApproveRequest(viewedRequest, reviewAndRecommendations, dateOfApproval, loanAmountApproved, additionalRequirements)
            }
            onDisapprove={(reviewAndRecommendations, additionalRequirements) =>
              void handleDisapproveRequest(viewedRequest, reviewAndRecommendations, additionalRequirements)
            }
            onReturnToManager={(notes) =>
              void handleReturnToManager(viewedRequest, notes)
            }
          />
        ) : null}

        <section className="backend-strip" aria-label="Backend details">
          {backendRows.slice(2).map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function NewRequestForm({
  editingRequest,
  onCancel,
  onCreated,
  user,
}: {
  editingRequest?: LoanRequest | null;
  onCancel: () => void;
  onCreated: () => void;
  user: AuthenticatedUser;
}) {
  const [request, setRequest] = useState<NewLoanRequest>(() =>
    createEmptyLoanRequest(),
  );
  const [otherLoans, setOtherLoans] = useState<NewOtherLoan[]>([
    createEmptyOtherLoan(),
  ]);
  const [comakers, setComakers] = useState<NewComaker[]>([
    createEmptyComaker(),
  ]);
  const [securities, setSecurities] = useState<NewSecurity[]>([
    createEmptySecurity(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<Member[]>([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [isLoadingLoanTypes, setIsLoadingLoanTypes] = useState(true);
  const [isLoadingEditingRequest, setIsLoadingEditingRequest] =
    useState(false);
  const isEditing = Boolean(editingRequest);

  useEffect(() => {
    const fetchLoanTypes = async () => {
      try {
        const response = await getLoanTypes();
        setLoanTypes(response.loanTypes || []);
      } catch (error) {
        console.error('Failed to load loan types:', error);
      } finally {
        setIsLoadingLoanTypes(false);
      }
    };
    fetchLoanTypes();
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadEditingRequest = async () => {
      if (!editingRequest) {
        setRequest(createEmptyLoanRequest());
        setOtherLoans([createEmptyOtherLoan()]);
        setComakers([createEmptyComaker()]);
        setSecurities([createEmptySecurity()]);
        setFormError('');
        setIsLoadingEditingRequest(false);
        return;
      }

      setFormError('');
      setIsLoadingEditingRequest(true);
      setRequest(createRequestFromSummary(editingRequest));
      setOtherLoans([createEmptyOtherLoan()]);
      setComakers([createEmptyComaker()]);
      setSecurities([createEmptySecurity()]);

      if (!editingRequest.requestId) {
        setFormError('Unable to load full details: request ID is missing.');
        setIsLoadingEditingRequest(false);
        return;
      }

      try {
        const details = await getLoanRequestDetails({
          requestId: editingRequest.requestId,
        });

        if (!isCurrent) {
          return;
        }

        setRequest(normalizeLoanRequestForForm(details.request, editingRequest));
        setOtherLoans(normalizeOtherLoansForForm(details.otherLoans));
        setComakers(normalizeComakersForForm(details.comakers));
        setSecurities(normalizeSecuritiesForForm(details.securities));
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setFormError(`Unable to load full request details: ${getErrorMessage(error)}`);
      } finally {
        if (isCurrent) {
          setIsLoadingEditingRequest(false);
        }
      }
    };

    void loadEditingRequest();

    return () => {
      isCurrent = false;
    };
  }, [editingRequest]);

  const canSubmit =
    request.cif_key.trim().length > 0 &&
    request.fullname.trim().length > 0 &&
    !isLoadingEditingRequest &&
    !isSubmitting;

  const handleMemberSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setMemberSearchResults([]);
      setShowMemberDropdown(false);
      return;
    }

    setIsSearchingMembers(true);
    try {
      const response = await searchMembers({ query });
      setMemberSearchResults(response.members || []);
      setShowMemberDropdown(response.members.length > 0);
    } catch (error) {
      setMemberSearchResults([]);
    } finally {
      setIsSearchingMembers(false);
    }
  }, []);

  const handleSelectMember = useCallback((member: Member) => {
    setRequest((current) => ({
      ...current,
      cif_key: member.cif_key || '',
      fullname: member.client_name || '',
      address: member.address || '',
      age: member.age || '',
    }));
    setShowMemberDropdown(false);
    setMemberSearchResults([]);
  }, []);

  const handleRequestChange = (
    name: keyof NewLoanRequest,
    value: string,
  ) => {
    setRequest((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === 'fullname') {
      handleMemberSearch(value);
    }
  };

  const handleComakerChange = (
    index: number,
    name: keyof NewComaker,
    value: string,
  ) => {
    setComakers((current) =>
      current.map((comaker, rowIndex) =>
        rowIndex === index
          ? {
              ...comaker,
              [name]: value,
            }
          : comaker,
      ),
    );
  };

  const handleOtherLoanChange = (
    index: number,
    name: keyof NewOtherLoan,
    value: string,
  ) => {
    setOtherLoans((current) =>
      current.map((otherLoan, rowIndex) =>
        rowIndex === index
          ? {
              ...otherLoan,
              [name]: value,
            }
          : otherLoan,
      ),
    );
  };

  const handleSecurityChange = (
    index: number,
    name: keyof NewSecurity,
    value: string,
  ) => {
    setSecurities((current) =>
      current.map((security, rowIndex) =>
        rowIndex === index
          ? {
              ...security,
              [name]: value,
            }
          : security,
      ),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const savedOtherLoans = otherLoans.filter((otherLoan) =>
      Object.values(otherLoan).some((value) => value.trim()),
    );
    const savedComakers = comakers
      .map((comaker) => ({
        fullname: comaker.fullname.trim(),
        loan_type: comaker.loan_type.trim(),
        loan_amount: comaker.loan_amount.trim(),
        loan_balance: comaker.loan_balance.trim(),
        status: comaker.status.trim(),
      }))
      .filter((comaker) =>
        Object.values(comaker).some((value) => value.length > 0),
      );
    const savedSecurities = securities
      .map((security) => ({
        nature: security.nature.trim(),
        market_value: security.market_value.trim(),
        appraised_value: security.appraised_value.trim(),
      }))
      .filter((security) =>
        Object.values(security).some((value) => value.length > 0),
      );
    const [comaker1 = '', comaker2 = '', comaker3 = '', comaker4 = ''] =
      savedComakers.map((comaker) => comaker.fullname);

    try {
      const payload = {
        branchid: user.branchid,
        createdBy: user.email,
        createdByName: user.fullname || user.email,
        otherLoans: savedOtherLoans,
        comakers: savedComakers,
        securities: savedSecurities,
        request: {
          ...request,
          request_id: editingRequest?.requestId || request.request_id,
          other_loans: String(savedOtherLoans.length),
          comaker1,
          comaker2,
          comaker3,
          comaker4,
        },
      };

      if (isEditing) {
        await updateLoanRequest(payload);
      } else {
        await createLoanRequest(payload);
      }

      onCreated();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <div className="form-section-heading">
        <div>
          <p className="eyebrow">{isEditing ? 'Edit Request' : 'New Request'}</p>
          <h3>
            {isEditing ? 'Update Member and Loan Details' : 'Member and Loan Details'}
          </h3>
        </div>
      </div>

      {isLoadingEditingRequest ? (
        <p className="notice-text">Loading selected request details...</p>
      ) : null}

      <div className="form-grid">
        {requestFields.map((field) => {
          if (field.name === 'fullname') {
            return (
              <label className="field-control autocomplete-field" key={field.name}>
                <span>{field.label}</span>
                <div className="autocomplete-container">
                  <input
                    name={field.name}
                    onChange={(event) =>
                      handleRequestChange(field.name, event.target.value)
                    }
                    onFocus={() => {
                      if (request.fullname.trim() && memberSearchResults.length > 0) {
                        setShowMemberDropdown(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowMemberDropdown(false), 200);
                    }}
                    required={true}
                    type="text"
                    value={request[field.name]}
                    placeholder="Type member name..."
                    autoComplete="off"
                  />
                  {showMemberDropdown && memberSearchResults.length > 0 && (
                    <ul className="autocomplete-dropdown">
                      {memberSearchResults.map((member, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            onClick={() => handleSelectMember(member)}
                            className="autocomplete-option"
                          >
                            <div className="option-main">{member.client_name}</div>
                            <div className="option-details">
                              CIF: {member.cif_key}
                              {member.occupation && ` • ${member.occupation}`}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {isSearchingMembers && (
                    <div className="autocomplete-loading">Searching...</div>
                  )}
                </div>
              </label>
            );
          }
          if (field.name === 'loan_type') {
            return (
              <label
                className={`field-control ${field.span === 'full' ? 'full' : ''}`}
                key={field.name}
              >
                <span>{field.label}</span>
                <select
                  name={field.name}
                  onChange={(event) =>
                    handleRequestChange(field.name, event.target.value)
                  }
                  value={request[field.name]}
                >
                  <option value="">Select a loan type...</option>
                  {loanTypes.map((loanType) => (
                    <option key={loanType.loan_id} value={loanType.loantype}>
                      {loanType.loantype}
                      {loanType.description && ` - ${loanType.description}`}
                    </option>
                  ))}
                </select>
              </label>
            );
          }
          return (
            <label
              className={`field-control ${field.span === 'full' ? 'full' : ''}`}
              key={field.name}
            >
              <span>{field.label}</span>
              {field.span === 'full' ? (
                <textarea
                  name={field.name}
                  onChange={(event) =>
                    handleRequestChange(field.name, event.target.value)
                  }
                  value={request[field.name]}
                />
              ) : (
                <input
                  name={field.name}
                  onChange={(event) =>
                    handleRequestChange(field.name, event.target.value)
                  }
                  required={field.name === 'cif_key'}
                  type={field.type || 'text'}
                  value={request[field.name]}
                />
              )}
            </label>
          );
        })}
      </div>

      <div className="form-section-heading">
        <div>
          <p className="eyebrow">Other Loans</p>
          <h3>Existing Loan Records</h3>
        </div>
        <button
          className="secondary-button inline-button"
          type="button"
          onClick={() =>
            setOtherLoans((current) => [...current, createEmptyOtherLoan()])
          }
        >
          <Plus size={17} aria-hidden="true" />
          Add Loan
        </button>
      </div>

      <div className="other-loans-list">
        {otherLoans.map((otherLoan, index) => (
          <div className="other-loan-row" key={index}>
            {otherLoanFields.map((field) => {
              if (field.name === 'loan_type') {
                return (
                  <label className="field-control" key={field.name}>
                    <span>{field.label}</span>
                    <select
                      name={`${field.name}-${index}`}
                      onChange={(event) =>
                        handleOtherLoanChange(index, field.name, event.target.value)
                      }
                      value={otherLoan[field.name]}
                    >
                      <option value="">Select Loan Type</option>
                      {loanTypes.map((type) => (
                        <option key={type.loan_id} value={type.loantype}>
                          {type.loantype}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }
              return (
                <label className="field-control" key={field.name}>
                  <span>{field.label}</span>
                  <input
                    name={`${field.name}-${index}`}
                    onChange={(event) =>
                      handleOtherLoanChange(index, field.name, event.target.value)
                    }
                    type={field.type || 'text'}
                    value={otherLoan[field.name]}
                  />
                </label>
              );
            })}
            <button
              className="icon-button remove-row-button"
              type="button"
              onClick={() =>
                setOtherLoans((current) =>
                  current.length === 1
                    ? [createEmptyOtherLoan()]
                    : current.filter((_, rowIndex) => rowIndex !== index),
                )
              }
              aria-label="Remove other loan"
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className="form-section-heading">
        <div>
          <p className="eyebrow">Comakers</p>
          <h3>Add Comakers and Their Loans</h3>
        </div>
        <button
          className="secondary-button inline-button"
          type="button"
          onClick={() =>
            setComakers((current) => [...current, createEmptyComaker()])
          }
        >
          <Plus size={17} aria-hidden="true" />
          Add Comaker
        </button>
      </div>

      <div className="comakers-list">
        {comakers.map((comaker, index) => (
          <div className="comaker-row" key={index}>
            <label className="field-control" key="fullname">
              <span>Full Name</span>
              <input
                name={`fullname-${index}`}
                onChange={(event) =>
                  handleComakerChange(index, 'fullname', event.target.value)
                }
                type="text"
                value={comaker.fullname}
                placeholder="Enter or search comaker name"
              />
            </label>
            {comakerFields.slice(1).map((field) => {
              if (field.name === 'loan_type') {
                return (
                  <label className="field-control" key={field.name}>
                    <span>{field.label}</span>
                    <select
                      name={`${field.name}-${index}`}
                      onChange={(event) =>
                        handleComakerChange(index, field.name, event.target.value)
                      }
                      value={comaker[field.name]}
                    >
                      <option value="">Select Loan Type</option>
                      {loanTypes.map((type) => (
                        <option key={type.loan_id} value={type.loantype}>
                          {type.loantype}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }
              return (
                <label className="field-control" key={field.name}>
                  <span>{field.label}</span>
                  <input
                    name={`${field.name}-${index}`}
                    onChange={(event) =>
                      handleComakerChange(index, field.name, event.target.value)
                    }
                    type={field.type || 'text'}
                    value={comaker[field.name]}
                  />
                </label>
              );
            })}
            <button
              className="icon-button remove-row-button"
              type="button"
              onClick={() =>
                setComakers((current) =>
                  current.length === 1
                    ? [createEmptyComaker()]
                    : current.filter((_, rowIndex) => rowIndex !== index),
                )
              }
              aria-label="Remove comaker"
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className="form-section-heading">
        <div>
          <p className="eyebrow">Securities</p>
          <h3>Collateral / Security Details</h3>
        </div>
        <button
          className="secondary-button inline-button"
          type="button"
          onClick={() =>
            setSecurities((current) => [...current, createEmptySecurity()])
          }
        >
          <Plus size={17} aria-hidden="true" />
          Add Security
        </button>
      </div>

      <div className="securities-list">
        {securities.map((security, index) => (
          <div className="security-row" key={index}>
            {securityFields.map((field) => (
              <label className="field-control" key={field.name}>
                <span>{field.label}</span>
                <input
                  name={`${field.name}-${index}`}
                  onChange={(event) =>
                    handleSecurityChange(index, field.name, event.target.value)
                  }
                  type={field.type || 'text'}
                  value={security[field.name]}
                />
              </label>
            ))}
            <button
              className="icon-button remove-row-button"
              type="button"
              onClick={() =>
                setSecurities((current) =>
                  current.length === 1
                    ? [createEmptySecurity()]
                    : current.filter((_, rowIndex) => rowIndex !== index),
                )
              }
              aria-label="Remove security"
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {formError ? <p className="error-text">{formError}</p> : null}

      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={onCancel}>
          <X size={17} aria-hidden="true" />
          Cancel
        </button>
        <button className="primary-button inline-primary" type="submit" disabled={!canSubmit}>
          <Save size={17} aria-hidden="true" />
          {isSubmitting
            ? isEditing
              ? 'Updating'
              : 'Saving'
            : isEditing
              ? 'Update Request'
              : 'Save Request'}
        </button>
      </div>
    </form>
  );
}

function RequestTable({
  isLoading,
  requests,
  sheetConfigured,
  onViewRequest,
}: {
  isLoading: boolean;
  requests: LoanRequest[];
  sheetConfigured: boolean;
  onViewRequest?: (request: LoanRequest) => void;
}) {
  let emptyMessage = 'No requests found.';

  if (isLoading) {
    emptyMessage = 'Loading requests.';
  } else if (!sheetConfigured) {
    emptyMessage = 'LoanRequest sheet not found.';
  }

  return (
    <div className="requests-table" role="table" aria-label="Loan requests">
      <div className="requests-row requests-head" role="row">
        <span role="columnheader">Request ID</span>
        <span role="columnheader">Member</span>
        <span role="columnheader">Loan Type</span>
        <span role="columnheader">Amount</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Requested</span>
        <span role="columnheader">Action</span>
      </div>

      {requests.length ? (
        requests.map((request) => (
          <div className="requests-row" role="row" key={getRequestKey(request)}>
            <span>{request.requestId || '-'}</span>
            <strong>{request.memberName || '-'}</strong>
            <span>{request.loanType || '-'}</span>
            <span>{request.amount || '-'}</span>
            <span>
              <StatusBadge status={request.status} />
            </span>
            <span>{request.requestedAt || '-'}</span>
            <span>
              <button
                className="icon-action"
                type="button"
                onClick={() => onViewRequest?.(request)}
                title="View request details"
              >
                <Eye size={16} aria-hidden="true" />
                View
              </button>
            </span>
          </div>
        ))
      ) : (
        <div className="requests-empty" role="row">
          <span>{emptyMessage}</span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeRole(status);

  return (
    <span className={`status-badge ${normalized || 'unknown'}`}>
      {status || 'Unknown'}
    </span>
  );
}

function RequestDetailPanel({
  dashboard,
  errorMessage,
  isApproving,
  isDisapproving,
  isForwarding,
  isReturning,
  isReturningToManager,
  request,
  onClose,
  onApprove,
  onDisapprove,
  onEdit,
  onForward,
  onReturn,
  onReturnToManager,
}: {
  dashboard: DashboardKind;
  errorMessage: string;
  isApproving: boolean;
  isDisapproving: boolean;
  isForwarding: boolean;
  isReturning: boolean;
  isReturningToManager: boolean;
  request: LoanRequest;
  onClose: () => void;
  onApprove: (reviewAndRecommendations?: string, dateOfApproval?: string, loanAmountApproved?: string, additionalRequirements?: string) => void;
  onDisapprove: (reviewAndRecommendations?: string, additionalRequirements?: string) => void;
  onEdit: () => void;
  onForward: (notes: string) => void;
  onReturn: (notes: string) => void;
  onReturnToManager: (notes: string) => void;
}) {
  const [details, setDetails] = useState<LoanRequestDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [managerNotes, setManagerNotes] = useState(request.managerNotes || '');
  const [approverNotes, setApproverNotes] = useState(request.approverNotes || '');
  const [reviewAndRecommendations, setReviewAndRecommendations] = useState(request.reviewAndRecommendations || '');
  const [dateOfApproval, setDateOfApproval] = useState(request.dateOfApproval || '');
  const [loanAmountApproved, setLoanAmountApproved] = useState(request.loanAmountApproved || '');
  const [additionalRequirements, setAdditionalRequirements] = useState(request.additionalRequirements || '');

  useEffect(() => {
    let isCurrent = true;

    const loadDetails = async () => {
      setDetails(null);
      setDetailsError('');
      setManagerNotes(request.managerNotes || '');
      setApproverNotes(request.approverNotes || '');
      setReviewAndRecommendations(request.reviewAndRecommendations || '');
      setDateOfApproval(request.dateOfApproval || '');
      setLoanAmountApproved(request.loanAmountApproved || '');
      setAdditionalRequirements(request.additionalRequirements || '');

      if (!request.requestId) {
        setDetailsError('Unable to load full request details: request ID is missing.');
        return;
      }

      setIsLoadingDetails(true);

      try {
        const result = await getLoanRequestDetails({
          requestId: request.requestId,
        });

        if (!isCurrent) {
          return;
        }

        setDetails(result);
        setManagerNotes(result.managerNotes || request.managerNotes || '');
        setApproverNotes(result.approverNotes || request.approverNotes || '');
        setReviewAndRecommendations(result.reviewAndRecommendations || request.reviewAndRecommendations || '');
        setDateOfApproval(result.dateOfApproval || request.dateOfApproval || '');
        setLoanAmountApproved(result.loanAmountApproved || request.loanAmountApproved || '');
        setAdditionalRequirements(result.additionalRequirements || request.additionalRequirements || '');
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setDetailsError(`Unable to load full request details: ${getErrorMessage(error)}`);
      } finally {
        if (isCurrent) {
          setIsLoadingDetails(false);
        }
      }
    };

    void loadDetails();

    return () => {
      isCurrent = false;
    };
  }, [request.approverNotes, request.managerNotes, request.requestId]);

  const status = details?.status || request.status;
  const normalizedStatus = normalizeRole(status);
  const isPending = normalizedStatus === 'pending';
  const isReturned = normalizedStatus === 'returned';
  const isReturnedToManager = normalizedStatus === 'returnedtomanager';
  const isForwarded = normalizedStatus === 'forwarded';
  const isApproved = normalizedStatus === 'approved';
  const canEdit = dashboard === 'teller' && (isPending || isReturned);
  const canForward = dashboard === 'manager' && (isPending || isReturnedToManager);
  const canReturn = dashboard === 'manager' && (isPending || isReturnedToManager);
  const canApprove = dashboard === 'approver' && isForwarded;
  const canDisapprove = dashboard === 'approver' && isForwarded;
  const canReturnToManager = dashboard === 'approver' && isForwarded;
  const canPrint = dashboard === 'teller' && (isPending || isReturned || isApproved);
  const canManageNotes = canForward || canReturn;
  const canManageApproverNotes = canReturnToManager;
  const requestDetails = details?.request;
  const actionDisabled =
    isLoadingDetails ||
    isForwarding ||
    isReturning ||
    isApproving ||
    isDisapproving ||
    isReturningToManager;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Request Details</h3>
          <button
            className="icon-action"
            type="button"
            onClick={onClose}
            title="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-content">
          {isLoadingDetails ? (
            <p className="notice-text">Loading full request details...</p>
          ) : null}

          {detailsError ? <p className="error-text">{detailsError}</p> : null}

          <div className="screen-only-content">
            <DetailSection
              title="Request Summary"
              rows={[
                ['Request ID', requestDetails?.request_id || request.requestId],
                ['Status', <StatusBadge status={status} />],
                [
                  'Requested By',
                  details?.requestedByName ||
                    request.requestedByName ||
                    details?.requestedBy ||
                    request.requestedBy,
                ],
                ['Branch', details?.branchid || request.branchid],
                ['Request Date', requestDetails?.request_date || request.requestedAt],
              ]}
            />

            <DetailSection
              title="Personal Information"
              rows={[
                ['Name of Maker', requestDetails?.fullname || request.memberName],
                ['Address', requestDetails?.address],
                ['Age', requestDetails?.age],
                ['Share Capital', requestDetails?.share_capital],
                ['Date of Retirement', requestDetails?.date_of_retirement],
                ['Loan Type', requestDetails?.loan_type || request.loanType],
                ['Amount Applied', requestDetails?.amount_applied || request.amount],
                ['Loan Balance', requestDetails?.loan_balance],
              ]}
            />

            <DetailSection
              title="Employment Information"
              rows={[
                ['Employer', requestDetails?.employer],
                ['Position', requestDetails?.position],
                ["Employer's Address", requestDetails?.employers_address],
                ['Monthly Pension', requestDetails?.monthly_pension],
                ['Current Net Take Home Pay', requestDetails?.current_nthp],
                ['Analysis of Net Take Home Pay (1 yr)', requestDetails?.analysis_nthp],
              ]}
            />

            {details?.otherLoans && details.otherLoans.length > 0 ? (
              <DetailTable
                title="Other Loans"
                columns={[
                  ['Loan Type', 'loan_type'],
                  ['Loan Amount', 'loan_amount'],
                  ['Balance', 'balance'],
                  ['Status', 'status'],
                  ['Analysis', 'analysis'],
                ]}
                rows={details.otherLoans}
              />
            ) : null}

            {details?.comakers && details.comakers.length > 0 ? (
              <DetailTable
                title="Co-makers"
                columns={[
                  ['Full Name', 'fullname'],
                  ['Loan Type', 'loan_type'],
                  ['Loan Amount', 'loan_amount'],
                  ['Loan Balance', 'loan_balance'],
                  ['Status', 'status'],
                ]}
                rows={details.comakers}
              />
            ) : null}

            {details?.securities && details.securities.length > 0 ? (
              <DetailTable
                title="Securities"
                columns={[
                  ['Nature', 'nature'],
                  ['Market Value', 'market_value'],
                  ['Appraised Value', 'appraised_value'],
                ]}
                rows={details.securities}
              />
            ) : null}

            <DetailSection
              title="Appraisal and Recommendation"
              rows={[
                ['Appraisal/CIBI Result', requestDetails?.appraisal_result],
                ['Recommendation', requestDetails?.recommendation || request.remarks],
              ]}
            />
          </div>

          {/* Print-Only Template */}
          <div className="print-only">
            {isLoadingDetails ? (
              <div className="print-loading">
                <p>Loading request details for print...</p>
                <span>Please wait while the system prepares your document.</span>
              </div>
            ) : (
              <ProcessingSheetPrintTemplate
                additionalRequirements={additionalRequirements}
                dateOfApproval={dateOfApproval}
                details={details}
                loanAmountApproved={loanAmountApproved}
                request={request}
                requestDetails={requestDetails}
                reviewAndRecommendations={reviewAndRecommendations}
              />
            )}
          </div>

          {canManageNotes || managerNotes.trim() ? (
            <label className="field-control manager-notes-field print-hidden">
              <span>Manager Notes</span>
              <textarea
                value={managerNotes}
                onChange={(event) => setManagerNotes(event.target.value)}
                readOnly={!canManageNotes}
                placeholder={
                  canManageNotes
                    ? 'Add notes or return instructions for the teller...'
                    : ''
                }
              />
              <small>Visible to the teller who made this request.</small>
            </label>
          ) : null}

          {canManageApproverNotes || approverNotes.trim() ? (
            <label className="field-control manager-notes-field print-hidden">
              <span>Approver Notes</span>
              <textarea
                value={approverNotes}
                onChange={(event) => setApproverNotes(event.target.value)}
                readOnly={!canManageApproverNotes}
                placeholder={
                  canManageApproverNotes
                    ? 'Add notes for the branch manager and teller...'
                    : ''
                }
              />
              <small>Visible to the branch manager and the teller who made this request.</small>
            </label>
          ) : null}

          {canManageApproverNotes ? (
            <div className="print-hidden">
              <label className="field-control manager-notes-field">
                <span>Review and Recommendations</span>
                <textarea
                  value={reviewAndRecommendations}
                  onChange={(event) => setReviewAndRecommendations(event.target.value)}
                  placeholder="Provide your review and recommendations..."
                />
                <small>Your detailed review and recommendations for this loan request.</small>
              </label>

              <label className="field-control">
                <span>Date of Approval</span>
                <input
                  type="date"
                  value={dateOfApproval}
                  onChange={(event) => setDateOfApproval(event.target.value)}
                />
              </label>

              <label className="field-control">
                <span>Loan Amount Approved</span>
                <input
                  type="number"
                  value={loanAmountApproved}
                  onChange={(event) => setLoanAmountApproved(event.target.value)}
                  placeholder="Enter the approved loan amount"
                />
              </label>

              <label className="field-control manager-notes-field">
                <span>Additional Requirements (if any)</span>
                <textarea
                  value={additionalRequirements}
                  onChange={(event) => setAdditionalRequirements(event.target.value)}
                  placeholder="List any additional requirements or conditions..."
                />
                <small>Any special conditions or requirements for this approved loan.</small>
              </label>
            </div>
          ) : null}

          {!canManageApproverNotes && (reviewAndRecommendations.trim() || dateOfApproval.trim() || loanAmountApproved.trim() || additionalRequirements.trim()) ? (
            <div className="print-hidden">
              {reviewAndRecommendations.trim() ? (
                <label className="field-control manager-notes-field">
                  <span>Review and Recommendations</span>
                  <textarea
                    value={reviewAndRecommendations}
                    readOnly
                  />
                </label>
              ) : null}

              {dateOfApproval.trim() ? (
                <label className="field-control">
                  <span>Date of Approval</span>
                  <input
                    type="date"
                    value={dateOfApproval}
                    readOnly
                  />
                </label>
              ) : null}

              {loanAmountApproved.trim() ? (
                <label className="field-control">
                  <span>Loan Amount Approved</span>
                  <input
                    type="number"
                    value={loanAmountApproved}
                    readOnly
                  />
                </label>
              ) : null}

              {additionalRequirements.trim() ? (
                <label className="field-control manager-notes-field">
                  <span>Additional Requirements (if any)</span>
                  <textarea
                    value={additionalRequirements}
                    readOnly
                  />
                </label>
              ) : null}
            </div>
          ) : null}
        </div>

        {errorMessage ? <p className="error-text modal-error">{errorMessage}</p> : null}

        <div className="modal-footer">
          {canEdit ? (
            <button
              className="primary-button"
              type="button"
              onClick={onEdit}
            >
              <Edit size={16} aria-hidden="true" />
              Edit Request
            </button>
          ) : null}
          {canForward ? (
            <button
              className="primary-button"
              type="button"
              onClick={() => onForward(managerNotes)}
              disabled={actionDisabled}
            >
              <Send size={16} aria-hidden="true" />
              {isForwarding ? 'Forwarding' : 'Forward for Approval'}
            </button>
          ) : null}
          {canReturn ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onReturn(managerNotes)}
              disabled={actionDisabled}
            >
              <RefreshCw size={16} aria-hidden="true" />
              {isReturning ? 'Returning' : 'Return to Teller'}
            </button>
          ) : null}
          {canApprove ? (
            <button
              className="primary-button"
              type="button"
              onClick={() => onApprove(reviewAndRecommendations, dateOfApproval, loanAmountApproved, additionalRequirements)}
              disabled={actionDisabled}
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              {isApproving ? 'Approving' : 'Approve'}
            </button>
          ) : null}
          {canDisapprove ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onDisapprove(reviewAndRecommendations, additionalRequirements)}
              disabled={actionDisabled}
            >
              <X size={16} aria-hidden="true" />
              {isDisapproving ? 'Disapproving' : 'Disapproved'}
            </button>
          ) : null}
          {canReturnToManager ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onReturnToManager(approverNotes)}
              disabled={actionDisabled}
            >
              <RefreshCw size={16} aria-hidden="true" />
              {isReturningToManager ? 'Returning' : 'Return to Branch Manager'}
            </button>
          ) : null}
          {canPrint ? (
            <button
              className="primary-button"
              type="button"
              onClick={() => window.print()}
            >
              <Printer size={16} aria-hidden="true" />
              Print
            </button>
          ) : null}
          <button
            className="secondary-button"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  rows,
  title,
  printHidden = false,
}: {
  rows: Array<[string, ReactNode]>;
  title: string;
  printHidden?: boolean;
}) {
  return (
    <section className={`detail-section ${printHidden ? 'print-hidden' : ''}`}>
      <h4>{title}</h4>
      <div className="detail-grid">
        {rows.map(([label, value]) => (
          <div className="detail-row" key={label}>
            <span className="detail-label">{label}</span>
            <span>{renderDetailValue(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

type ProcessingSheetPrintTemplateProps = {
  additionalRequirements: string;
  dateOfApproval: string;
  details: LoanRequestDetails | null;
  loanAmountApproved: string;
  request: LoanRequest;
  requestDetails?: NewLoanRequest;
  reviewAndRecommendations: string;
};

type ProcessingTableColumn<T> = {
  getValue: (row: T) => string;
  label: string;
};

function ProcessingSheetPrintTemplate({
  additionalRequirements,
  dateOfApproval,
  details,
  loanAmountApproved,
  request,
  requestDetails,
  reviewAndRecommendations,
}: ProcessingSheetPrintTemplateProps) {
  const source = requestDetails || details?.request;
  const otherLoanRows = getPrintableRows(details?.otherLoans);
  const comakerRows = getPrintableRows(details?.comakers);
  const securityRows = getPrintableRows(details?.securities);
  const preparedByName = firstPrintableText(
    details?.requestedByName,
    request.requestedByName,
    details?.requestedBy,
    request.requestedBy,
  );
  const notedByName = firstPrintableText(
    details?.managerByName,
    request.managerByName,
    details?.managerBy,
    request.managerBy,
  );
  const hasReviewAndRecommendations = reviewAndRecommendations.trim().length > 0;
  const hasDateOfApproval = dateOfApproval.trim().length > 0;
  const hasLoanAmountApproved = loanAmountApproved.trim().length > 0;
  const hasAdditionalRequirements = additionalRequirements.trim().length > 0;
  const hasFinalApprovalFields =
    hasDateOfApproval || hasLoanAmountApproved || hasAdditionalRequirements;

  return (
    <article className="processing-sheet">
      <header className="processing-header">
        <h1>BARBAZA MULTI-PURPOSE COOPERATIVE</h1>
        <p>Cubay, Barbaza, Antique</p>
        <h2>PROCESSING SHEET FOR HEAD OFFICE APPROVAL</h2>
      </header>

      <section className="processing-section">
        <h3 className="processing-section-title">PERSONAL INFORMATION</h3>
        <div className="processing-personal-grid">
          <div className="processing-field-column">
            <ProcessingFieldLine
              label="Name of Maker"
              value={firstPrintableText(source?.fullname, request.memberName)}
            />
            <ProcessingFieldLine label="Address" value={source?.address} />
            <ProcessingFieldLine label="Age" value={source?.age} />
            <ProcessingFieldLine
              label="Share Capital"
              value={source?.share_capital}
            />
            <ProcessingFieldLine
              label="Date of Retirement"
              value={source?.date_of_retirement}
            />
            <ProcessingFieldLine
              label="Loan Type"
              value={firstPrintableText(source?.loan_type, request.loanType)}
            />
            <ProcessingFieldLine
              label="Amount Applied"
              value={firstPrintableText(source?.amount_applied, request.amount)}
            />
            <ProcessingFieldLine
              label="Loan Balance"
              value={source?.loan_balance}
            />
          </div>

          <div className="processing-field-column processing-employment-column">
            <ProcessingFieldLine label="Employer" value={source?.employer} />
            <ProcessingFieldLine label="Position" value={source?.position} />
            <ProcessingFieldLine
              label="Employers Address"
              value={source?.employers_address}
            />
            <ProcessingFieldLine
              label="Monthly Pension"
              value={source?.monthly_pension}
            />
            <ProcessingFieldLine
              label="Current Net Take Home Pay"
              value={source?.current_nthp}
            />
            <ProcessingFieldLine
              label="Analysis of Net Take Home Pay (1 yr)"
              value={source?.analysis_nthp}
            />
            <div className="processing-continuation-line" />
          </div>
        </div>
      </section>

      <section className="processing-section">
        <h3 className="processing-section-title">OTHER LOAN AVAILMENT</h3>
        <ProcessingUnderlineTable
          className="processing-loan-table"
          columns={[
            { label: 'Loan Type', getValue: (loan) => loan.loan_type },
            { label: 'Loan Amount', getValue: (loan) => loan.loan_amount },
            { label: 'Balance', getValue: (loan) => loan.balance },
            { label: 'Status', getValue: (loan) => loan.status },
            {
              label: 'Analysis of Previous Loan',
              getValue: (loan) => loan.analysis,
            },
          ]}
          rows={otherLoanRows}
        />
      </section>

      <section className="processing-section">
        <h3 className="processing-section-title">COMAKERSHIP</h3>
        <ProcessingUnderlineTable
          className="processing-comaker-table"
          columns={[
            { label: 'Co-makers:', getValue: (comaker) => comaker.fullname },
            { label: 'Loan Type', getValue: (comaker) => comaker.loan_type },
            {
              label: 'Loan Amount',
              getValue: (comaker) => comaker.loan_amount,
            },
            {
              label: 'Loan Balance',
              getValue: (comaker) => comaker.loan_balance,
            },
            { label: 'Status', getValue: (comaker) => comaker.status },
          ]}
          rows={comakerRows}
        />
      </section>

      <section className="processing-section">
        <h3 className="processing-section-title">SECURITIES OFFERED</h3>
        <ProcessingUnderlineTable
          className="processing-security-table"
          columns={[
            { label: 'Nature', getValue: (security) => security.nature },
            {
              label: 'Market Value',
              getValue: (security) => security.market_value,
            },
            {
              label: 'Appraised Value',
              getValue: (security) => security.appraised_value,
            },
          ]}
          rows={securityRows}
        />
      </section>

      <section className="processing-section">
        <h3 className="processing-section-title processing-title-with-note">
          <span>APPRAISAL/CI/BI RESULTS</span>
          <em>(Conducted by Branch T/A or Manager)</em>
        </h3>
        <ProcessingLinedBlock value={source?.appraisal_result} />
      </section>

      <section className="processing-section">
        <h3 className="processing-section-title">RECOMMENDATION:</h3>
        <ProcessingLinedBlock
          value={firstPrintableText(source?.recommendation, request.remarks)}
        />
      </section>

      <section className="processing-signatures">
        <div className="processing-signature-cell">
          <span>Prepared By:</span>
          <div className="processing-signature-block">
            <div className="processing-signature-line" />
            <strong>{printableValue(preparedByName)}</strong>
            <p>Loan Account Specialist</p>
          </div>
        </div>
        <div className="processing-signature-cell">
          <span>Noted By:</span>
          <div className="processing-signature-block">
            <div className="processing-signature-line" />
            <strong>{printableValue(notedByName)}</strong>
            <p>Branch Manager</p>
          </div>
        </div>
      </section>

      <section className="processing-section processing-final-section">
        <h3 className="processing-section-title">For Final Approval:</h3>
        {hasReviewAndRecommendations ? (
          <>
            <h4>Review and Recommendations:</h4>
            <ProcessingLinedBlock value={reviewAndRecommendations} />
          </>
        ) : null}

        {hasFinalApprovalFields ? (
          <div className="processing-final-fields">
            {hasDateOfApproval ? (
              <ProcessingFieldLine label="Date" value={dateOfApproval} />
            ) : null}
            {hasLoanAmountApproved ? (
              <ProcessingFieldLine
                label="Loan Amount Approved"
                value={loanAmountApproved}
              />
            ) : null}
            {hasAdditionalRequirements ? (
              <ProcessingFieldLine
                label="Additional Requirements"
                value={additionalRequirements}
              />
            ) : null}
          </div>
        ) : null}

        <div className="processing-authority">
          <span>Approving Authority:</span>
          <div>
            <strong>ERWIN A. BANA, CPA</strong>
            <p>Savings and Credit Head</p>
          </div>
        </div>

        <div className="processing-documents">
          <span>Documents Attached:</span>
          <div>
            <p>*Loan Project Appraisal Report</p>
            <p>*Pay Slip or Snapshot of Bank Statement (1 yr.)- If applicable</p>
            <p>*Scanned Copy Certification from Head Office- if applicable</p>
          </div>
        </div>
      </section>
    </article>
  );
}

function ProcessingFieldLine({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="processing-field-line">
      <span className="processing-field-label">{label}</span>
      <span className="processing-field-separator">:</span>
      <span className="processing-field-value">{printableValue(value)}</span>
    </div>
  );
}

function ProcessingUnderlineTable<T>({
  className,
  columns,
  rows,
}: {
  className: string;
  columns: Array<ProcessingTableColumn<T>>;
  rows: T[];
}) {
  if (!rows.length) {
    return null;
  }

  return (
    <div className={`processing-table ${className}`}>
      <div className="processing-table-header">
        {columns.map((column) => (
          <strong key={column.label}>{column.label}</strong>
        ))}
      </div>
      {rows.map((row, rowIndex) => (
        <div className="processing-table-row" key={rowIndex}>
          {columns.map((column) => (
            <span key={`${rowIndex}-${column.label}`}>
              {printableValue(column.getValue(row))}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProcessingLinedBlock({
  value,
}: {
  value?: string;
}) {
  const lines = splitPrintLines(value || '', 118);

  if (!lines.length) {
    return null;
  }

  return (
    <div className="processing-lined-block">
      {lines.map((line, index) => (
        <div className="processing-write-line" key={index}>
          {line}
        </div>
      ))}
    </div>
  );
}

function getPrintableRows<T extends object>(rows: T[] | undefined) {
  return (rows || []).filter(rowHasPrintableValue);
}

function rowHasPrintableValue(row: object) {
  return Object.values(row).some((value) =>
    String(value || '').trim().length > 0,
  );
}

function firstPrintableText(...values: Array<string | undefined | null>) {
  return values.find((value) => value && value.trim().length > 0)?.trim() || '';
}

function printableValue(value?: string) {
  return value && value.trim().length > 0 ? value.trim() : '\u00A0';
}

function splitPrintLines(value: string, maxChars: number) {
  return value
    .split(/\r?\n/)
    .flatMap((line) => wrapPrintLine(line.trim(), maxChars))
    .filter((line) => line.length > 0);
}

function wrapPrintLine(value: string, maxChars: number) {
  if (value.length <= maxChars) {
    return value ? [value] : [];
  }

  const lines: string[] = [];
  let currentLine = '';

  value.split(/\s+/).forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxChars && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      return;
    }

    currentLine = nextLine;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function DetailTable({
  columns,
  rows,
  title,
  printHidden = false,
}: {
  columns: Array<[string, string]>;
  rows: unknown[];
  title: string;
  printHidden?: boolean;
}) {
  return (
    <section className={`detail-section ${printHidden ? 'print-hidden' : ''}`}>
      <h4>{title}</h4>
      {rows.length ? (
        <div
          className="detail-table"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(120px, 1fr))`,
          }}
        >
          {columns.map(([label]) => (
            <strong key={label}>{label}</strong>
          ))}
          {rows.map((row, rowIndex) =>
            columns.map(([label, key]) => (
              <span key={`${rowIndex}-${key}-${label}`}>
                {renderDetailValue(getDetailCellValue(row, key))}
              </span>
            )),
          )}
        </div>
      ) : (
        <p className="detail-empty">No records listed.</p>
      )}
    </section>
  );
}

function renderDetailValue(value: ReactNode) {
  if (typeof value === 'string') {
    return value.trim() || '-';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return value || '-';
}

function getDetailCellValue(row: unknown, key: string) {
  if (!row || typeof row !== 'object') {
    return '';
  }

  const value = (row as Record<string, unknown>)[key];

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return '';
}

function ConnectionNotice({
  activeStatus,
  connectionState,
  compact = false,
}: {
  activeStatus: StatusCopy;
  connectionState: AppsScriptConnectionState;
  compact?: boolean;
}) {
  const Icon = connectionState === 'connected' ? CheckCircle2 : AlertTriangle;

  return (
    <div
      className={`connection-state ${connectionState} ${
        compact ? 'compact' : ''
      }`}
    >
      <Icon size={24} aria-hidden="true" />
      <div>
        <strong>{activeStatus.label}</strong>
        <span>{activeStatus.detail}</span>
      </div>
    </div>
  );
}

function useLoanRequests(
  user: AuthenticatedUser,
  dashboard: DashboardKind,
  view: DashboardView,
  refreshToken: number,
) {
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [sheetConfigured, setSheetConfigured] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    const loadRequests = async () => {
      setRequestError('');

      if (!hasGoogleAppsScriptUrl) {
        setRequests([]);
        setSheetConfigured(false);
        return;
      }

      setIsLoading(true);

      try {
        const result = await listLoanRequests({
          branchid: user.branchid,
          dashboard,
          email: user.email,
          view,
        });

        if (!isCurrent) {
          return;
        }

        setRequests(result.requests);
        setSheetConfigured(result.sheetConfigured);
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setRequests([]);
        setRequestError(getErrorMessage(error));
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void loadRequests();

    return () => {
      isCurrent = false;
    };
  }, [dashboard, refreshToken, user.branchid, user.email, view]);

  return {
    isLoading,
    requestError,
    requests,
    sheetConfigured,
  };
}

function getSummaryCards({
  activeMenu,
  dashboard,
  requests,
  sheetConfigured,
  user,
}: {
  activeMenu: DashboardMenu;
  dashboard: DashboardKind;
  requests: LoanRequest[];
  sheetConfigured: boolean;
  user: AuthenticatedUser;
}) {
  return [
    {
      icon: activeMenu.icon,
      label: activeMenu.label,
      value: String(requests.length),
    },
    {
      icon: UsersRound,
      label: 'Branch',
      value: user.branchid || '-',
    },
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      value: dashboard === 'approver' ? 'Head' : titleCase(dashboard),
    },
    {
      icon: ClipboardCheck,
      label: 'Requests',
      value: sheetConfigured ? 'Live' : 'Setup',
    },
  ];
}

function getCurrentPageKind(): PageKind {
  const pathname = window.location.pathname.toLowerCase();

  if (pathname.endsWith('/teller.html')) {
    return 'teller';
  }

  if (pathname.endsWith('/manager.html')) {
    return 'manager';
  }

  if (pathname.endsWith('/approver.html')) {
    return 'approver';
  }

  return 'login';
}

function getDashboardForUser(user: AuthenticatedUser): DashboardKind {
  const role = user.role.trim().toLowerCase();

  if (role === 'teller') {
    return 'teller';
  }

  if (role === 'branch_manager') {
    return 'manager';
  }

  if (role === 'approver') {
    return 'approver';
  }

  const profile = normalizeRole(`${user.role} ${user.position}`);

  if (profile.includes('branchmanager') || profile.includes('manager')) {
    return 'manager';
  }

  if (
    profile.includes('savingsandcredit') ||
    profile.includes('credithead') ||
    profile.includes('approver')
  ) {
    return 'approver';
  }

  return 'teller';
}

function redirectToUserDashboard(
  user: AuthenticatedUser,
  mode: 'assign' | 'replace',
) {
  const dashboard = getDashboardForUser(user);
  const nextPath = dashboardConfigs[dashboard].landingPath;

  if (window.location.pathname.toLowerCase().endsWith(nextPath)) {
    return;
  }

  if (mode === 'replace') {
    window.location.replace(nextPath);
    return;
  }

  window.location.assign(nextPath);
}

function normalizeRole(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getRequestKey(request: LoanRequest) {
  return [
    request.requestId,
    request.memberName,
    request.amount,
    request.status,
    request.requestedAt,
  ].join('|');
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function createEmptyLoanRequest(): NewLoanRequest {
  return {
    request_date: getToday(),
    cif_key: '',
    fullname: '',
    address: '',
    age: '',
    share_capital: '',
    date_of_retirement: '',
    loan_type: '',
    amount_applied: '',
    loan_balance: '',
    other_loans: '',
    employer: '',
    position: '',
    employers_address: '',
    monthly_pension: '',
    current_nthp: '',
    analysis_nthp: '',
    comaker1: '',
    comaker2: '',
    comaker3: '',
    comaker4: '',
    appraisal_result: '',
    recommendation: '',
  };
}

function createEmptyOtherLoan(): NewOtherLoan {
  return {
    loan_type: '',
    loan_amount: '',
    balance: '',
    status: '',
    analysis: '',
  };
}

function createEmptyComaker(): NewComaker {
  return {
    fullname: '',
    loan_type: '',
    loan_amount: '',
    loan_balance: '',
    status: '',
  };
}

function createEmptySecurity(): NewSecurity {
  return {
    nature: '',
    market_value: '',
    appraised_value: '',
  };
}

function createRequestFromSummary(summary: LoanRequest): NewLoanRequest {
  const request = createEmptyLoanRequest();

  return {
    ...request,
    request_id: summary.requestId,
    request_date: toDateInputValue(summary.requestedAt) || request.request_date,
    fullname: summary.memberName || '',
    loan_type: summary.loanType || '',
    amount_applied: summary.amount || '',
    recommendation: summary.remarks || '',
  };
}

function normalizeLoanRequestForForm(
  source: NewLoanRequest,
  fallback?: LoanRequest,
): NewLoanRequest {
  const empty = createEmptyLoanRequest();
  const request = fallback ? createRequestFromSummary(fallback) : empty;

  (Object.keys(empty) as Array<keyof NewLoanRequest>).forEach((field) => {
    const value = source[field];

    if (typeof value !== 'undefined' && value !== null) {
      request[field] = String(value);
    }
  });

  request.request_id = source.request_id || fallback?.requestId || request.request_id;
  request.request_date =
    toDateInputValue(request.request_date) || empty.request_date;
  request.date_of_retirement = toDateInputValue(request.date_of_retirement);

  return request;
}

function normalizeOtherLoansForForm(rows: NewOtherLoan[] = []): NewOtherLoan[] {
  const normalized = rows
    .map((row) => ({
      loan_type: String(row.loan_type || ''),
      loan_amount: String(row.loan_amount || ''),
      balance: String(row.balance || ''),
      status: String(row.status || ''),
      analysis: String(row.analysis || ''),
    }))
    .filter(hasAnyValue);

  return normalized.length ? normalized : [createEmptyOtherLoan()];
}

function normalizeComakersForForm(rows: NewComaker[] = []): NewComaker[] {
  const normalized = rows
    .map((row) => ({
      fullname: String(row.fullname || ''),
      loan_type: String(row.loan_type || ''),
      loan_amount: String(row.loan_amount || ''),
      loan_balance: String(row.loan_balance || ''),
      status: String(row.status || ''),
    }))
    .filter(hasAnyValue);

  return normalized.length ? normalized : [createEmptyComaker()];
}

function normalizeSecuritiesForForm(rows: NewSecurity[] = []): NewSecurity[] {
  const normalized = rows
    .map((row) => ({
      nature: String(row.nature || ''),
      market_value: String(row.market_value || ''),
      appraised_value: String(row.appraised_value || ''),
    }))
    .filter(hasAnyValue);

  return normalized.length ? normalized : [createEmptySecurity()];
}

function hasAnyValue(record: Record<string, string>) {
  return Object.values(record).some((value) => value.trim().length > 0);
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

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

const loadStoredUser = () => {
  try {
    const rawUser = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!rawUser) {
      return null;
    }

    const parsed = JSON.parse(rawUser) as AuthenticatedUser;
    return parsed.email ? parsed : null;
  } catch {
    return null;
  }
};

const saveStoredUser = (user: AuthenticatedUser) => {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof AppsScriptConfigurationError) {
    return 'Add VITE_GOOGLE_APPS_SCRIPT_WEB_APP_URL in .env.local after deployment.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected backend error.';
};

export default App;
