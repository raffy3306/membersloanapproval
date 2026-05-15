const APP_NAME = "Member's Loan Approval";
const VERSION = '0.1.0';
const USERS_SHEET_NAME = 'Users';
const MASTERLIST_SHEET_NAME = 'MasterList';
const LOANTYPE_SHEET_NAME = 'LoanType';
const REQUESTS_SHEET_NAME = 'LoanRequest';
const OTHER_LOANS_SHEET_NAME = 'OtherLoans';
const COMAKERS_SHEET_NAME = 'Comakers';
const SECURITIES_SHEET_NAME = 'Securities';
const BRANCHES_SHEET_NAME = 'Branch';
const SETTINGS_SHEET_NAME = 'Settings';
const USER_HEADERS = [
  'email',
  'password',
  'role',
  'fullname',
  'position',
  'branchid',
  'FirstLogin',
];
const SETTINGS_HEADERS = [
  'key',
  'value',
];
const REQUEST_HEADERS = [
  'request_id',
  'request_date',
  'cif_key',
  'fullname',
  'address',
  'age',
  'share_capital',
  'date_of_retirement',
  'loan_type',
  'amount_applied',
  'loan_balance',
  'other_loans',
  'employer',
  'position',
  'employers_address',
  'monthly_pension',
  'current_nthp',
  'analysis_nthp',
  'comaker1',
  'comaker2',
  'comaker3',
  'comaker4',
  'appraisal_result',
  'recommendation',
  'status',
  'requested_by',
  'requested_by_name',
  'branchid',
  'manager_notes',
  'approver_notes',
  'manager_by',
  'manager_by_name',
  'review_and_recommendations',
  'date_of_approval',
  'loan_amount_approved',
  'additional_requirements',
];
const OTHER_LOANS_HEADERS = [
  'request_id',
  'cif_key',
  'loan_type',
  'loan_amount',
  'balance',
  'status',
  'analysis',
];
const COMAKERS_HEADERS = [
  'request_id',
  'cif_key',
  'fullname',
  'loan_type',
  'loan_amount',
  'loan_balance',
  'status',
];
const SECURITIES_HEADERS = [
  'request_id',
  'nature',
  'market_value',
  'appraised_value',
];

function doGet(event) {
  return route_(event, 'GET');
}

function doPost(event) {
  return route_(event, 'POST');
}

function authorizeRequiredServices() {
  const spreadsheet = getSpreadsheet_();

  return {
    appName: APP_NAME,
    spreadsheetName: spreadsheet ? spreadsheet.getName() : '',
    remainingMailQuota: MailApp.getRemainingDailyQuota(),
  };
}

function route_(event, method) {
  try {
    const body = parseBody_(event);
    const params = event && event.parameter ? event.parameter : {};
    const action = String(
      body.action || params.action || 'health',
    );

    switch (action) {
      case 'health':
        return json_({
          ok: true,
          data: getHealth_(),
        });
      case 'login':
        return json_({
          ok: true,
          data: loginUser_(body.payload || {}),
        });
      case 'sendPasswordRecovery':
        return json_({
          ok: true,
          data: sendPasswordRecovery_(body.payload || {}),
        });
      case 'changePassword':
        return json_({
          ok: true,
          data: changePassword_(body.payload || {}),
        });
      case 'listRequests':
        return json_({
          ok: true,
          data: listRequests_(body.payload || {}),
        });
      case 'getRequestDetails':
        return json_({
          ok: true,
          data: getRequestDetails_(body.payload || {}),
        });
      case 'createRequest':
        return json_({
          ok: true,
          data: createRequest_(body.payload || {}),
        });
      case 'updateRequest':
        return json_({
          ok: true,
          data: updateRequest_(body.payload || {}),
        });
      case 'forwardRequest':
        return json_({
          ok: true,
          data: forwardRequest_(body.payload || {}),
        });
      case 'returnRequest':
        return json_({
          ok: true,
          data: returnRequest_(body.payload || {}),
        });
      case 'approveRequest':
        return json_({
          ok: true,
          data: approveRequest_(body.payload || {}),
        });
      case 'disapproveRequest':
        return json_({
          ok: true,
          data: disapproveRequest_(body.payload || {}),
        });
      case 'returnToManager':
        return json_({
          ok: true,
          data: returnToManager_(body.payload || {}),
        });
      case 'searchMembers':
        return json_({
          ok: true,
          data: searchMembers_(body.payload || {}),
        });
      case 'getLoanTypes':
        return json_({
          ok: true,
          data: getLoanTypes_(body.payload || {}),
        });
      case 'getComakerLoans':
        return json_({
          ok: true,
          data: getComakerLoans_(body.payload || {}),
        });
      case 'listAuditLogs':
        return json_({
          ok: true,
          data: listAuditLogs_(body.payload || {}),
        });
      case 'listUsers':
        return json_({
          ok: true,
          data: listUsers_(body.payload || {}),
        });
      case 'saveUser':
        return json_({
          ok: true,
          data: saveUser_(body.payload || {}),
        });
      case 'getSettings':
        return json_({
          ok: true,
          data: getSettings_(body.payload || {}),
        });
      case 'updateSettings':
        return json_({
          ok: true,
          data: updateSettings_(body.payload || {}),
        });
      default:
        return json_({
          ok: false,
          error: `Unknown action: ${action}`,
        });
    }
  } catch (error) {
    return json_({
      ok: false,
      error: error.message || String(error),
    });
  }
}

function parseBody_(event) {
  if (!event || !event.postData || !event.postData.contents) {
    return {};
  }

  try {
    return JSON.parse(event.postData.contents);
  } catch (error) {
    return {};
  }
}

function getHealth_() {
  const spreadsheet = getSpreadsheet_();
  const usersSheet = spreadsheet ? spreadsheet.getSheetByName(USERS_SHEET_NAME) : null;
  const masterListSheet = spreadsheet ? spreadsheet.getSheetByName(MASTERLIST_SHEET_NAME) : null;
  const loanTypeSheet = spreadsheet ? spreadsheet.getSheetByName(LOANTYPE_SHEET_NAME) : null;
  const requestsSheet = spreadsheet ? spreadsheet.getSheetByName(REQUESTS_SHEET_NAME) : null;
  const otherLoansSheet = spreadsheet ? spreadsheet.getSheetByName(OTHER_LOANS_SHEET_NAME) : null;
  const comakersSheet = spreadsheet ? spreadsheet.getSheetByName(COMAKERS_SHEET_NAME) : null;
  const securitiesSheet = spreadsheet ? spreadsheet.getSheetByName(SECURITIES_SHEET_NAME) : null;
  const branchesSheet = spreadsheet ? getBranchesSheet_(spreadsheet) : null;
  const settingsSheet = spreadsheet ? spreadsheet.getSheetByName(SETTINGS_SHEET_NAME) : null;

  return {
    appName: APP_NAME,
    version: VERSION,
    serverTime: new Date().toISOString(),
    scriptId: ScriptApp.getScriptId(),
    spreadsheetName: spreadsheet ? spreadsheet.getName() : '',
    spreadsheetConfigured: Boolean(spreadsheet),
    usersSheetConfigured: Boolean(usersSheet),
    masterListSheetConfigured: Boolean(masterListSheet),
    loanTypeSheetConfigured: Boolean(loanTypeSheet),
    requestsSheetConfigured: Boolean(requestsSheet),
    otherLoansSheetConfigured: Boolean(otherLoansSheet),
    comakersSheetConfigured: Boolean(comakersSheet),
    securitiesSheetConfigured: Boolean(securitiesSheet),
    branchesSheetConfigured: Boolean(branchesSheet),
    settingsSheetConfigured: Boolean(settingsSheet),
  };
}

function loginUser_(payload) {
  const email = normalizeEmail_(payload.email);
  const password = String(payload.password || '').trim();

  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const usersSheet = spreadsheet.getSheetByName(USERS_SHEET_NAME);

  if (!usersSheet) {
    throw new Error(`Sheet not found: ${USERS_SHEET_NAME}`);
  }

  const rows = usersSheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    throw new Error('Users sheet has no user records.');
  }

  const headers = getHeaderMap_(rows[0]);
  const branchNamesById = getBranchNamesById_(spreadsheet);
  requireColumns_(headers, [
    'email',
    'password',
    'role',
    'fullname',
    'position',
    'branchid',
    'firstlogin',
  ]);

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const rowEmail = normalizeEmail_(row[headers.email]);
    const rowPassword = cellValue_(row, headers.password);

    if (rowEmail === email && verifyPassword_(password, rowPassword)) {
      const branchid = cellValue_(row, headers.branchid);

      return {
        email: cellValue_(row, headers.email),
        role: cellValue_(row, headers.role),
        fullname: cellValue_(row, headers.fullname),
        position: cellValue_(row, headers.position),
        branchid: branchid,
        branchName: getBranchName_(branchNamesById, branchid),
        firstLogin: parseBoolean_(cellValue_(row, headers.firstlogin)),
      };
    }
  }

  throw new Error('Invalid email or password.');
}

function hashPassword_(password) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
  );
  return Utilities.base64Encode(digest);
}

function verifyPassword_(password, hashedPassword) {
  const computedHash = hashPassword_(password);
  return computedHash === hashedPassword || password === hashedPassword;
}

function sendPasswordRecovery_(payload) {
  const email = normalizeEmail_(payload.email);

  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    return { success: false, message: 'No spreadsheet is connected to the Apps Script project.' };
  }

  const usersSheet = spreadsheet.getSheetByName(USERS_SHEET_NAME);

  if (!usersSheet) {
    return { success: false, message: `Sheet not found: ${USERS_SHEET_NAME}` };
  }

  const rows = usersSheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return { success: false, message: 'Users sheet has no user records.' };
  }

  const headers = getHeaderMap_(rows[0]);
  const indexes = {
    email: firstHeaderIndex_(headers, ['email', 'user', 'username']),
    password: firstHeaderIndex_(headers, ['password']),
    fullname: firstHeaderIndex_(headers, ['fullname', 'full name', 'name']),
  };
  const missingColumns = [];

  if (indexes.email === -1) {
    missingColumns.push('email');
  }

  if (indexes.password === -1) {
    missingColumns.push('password');
  }

  if (indexes.fullname === -1) {
    missingColumns.push('fullname');
  }

  if (missingColumns.length) {
    return { success: false, message: 'Users sheet missing columns: ' + missingColumns.join(', ') };
  }

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const rowEmail = normalizeEmail_(cellValue_(row, indexes.email));
    const rowPassword = cellValue_(row, indexes.password);
    const fullname = cellValue_(row, indexes.fullname) || 'User';

    if (rowEmail === email) {
      if (!rowPassword) {
        return { success: false, message: 'Account found, but the password field is blank. Please contact your System Administrator.' };
      }

      try {
        MailApp.sendEmail({
          to: email,
          subject: "Password Recovery - Member's Loan Approval System",
          body: 'Hello ' + fullname + ',\n\n' +
            "You requested help signing in to the Member's Loan Approval System.\n\n" +
            'Your current password is: ' + rowPassword + '\n\n' +
            'Please sign in and change it with your administrator if needed.\n\n' +
            'If you did not request this email, please ignore it.',
          name: APP_NAME,
        });
        return { success: true, message: 'Password recovery email has been sent to ' + email + '.' };
      } catch (e) {
        return { success: false, message: 'Failed to send password recovery email: ' + getErrorMessage_(e) };
      }
    }
  }

  return { success: false, message: 'No account was found for that email address.' };
}

function changePassword_(payload) {
  const email = normalizeEmail_(payload.email);
  const currentPassword = String(payload.currentPassword || '').trim();
  const newPassword = String(payload.newPassword || '').trim();

  if (!email || !currentPassword || !newPassword) {
    return { success: false, message: 'Email, current password, and new password are required.' };
  }

  if (newPassword.length < 8) {
    return { success: false, message: 'New password must be at least 8 characters.' };
  }

  if (newPassword === currentPassword) {
    return { success: false, message: 'New password must be different from the current password.' };
  }

  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    return { success: false, message: 'No spreadsheet is connected to the Apps Script project.' };
  }

  const usersSheet = spreadsheet.getSheetByName(USERS_SHEET_NAME);

  if (!usersSheet) {
    return { success: false, message: `Sheet not found: ${USERS_SHEET_NAME}` };
  }

  const rows = usersSheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return { success: false, message: 'Users sheet has no user records.' };
  }

  const headers = getHeaderMap_(rows[0]);
  const indexes = {
    email: firstHeaderIndex_(headers, ['email', 'user', 'username']),
    password: firstHeaderIndex_(headers, ['password']),
    firstLogin: firstHeaderIndex_(headers, ['firstlogin', 'first_login', 'first login']),
  };
  const missingColumns = [];

  if (indexes.email === -1) {
    missingColumns.push('email');
  }

  if (indexes.password === -1) {
    missingColumns.push('password');
  }

  if (indexes.firstLogin === -1) {
    missingColumns.push('FirstLogin');
  }

  if (missingColumns.length) {
    return { success: false, message: 'Users sheet missing columns: ' + missingColumns.join(', ') };
  }

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const rowEmail = normalizeEmail_(cellValue_(row, indexes.email));
    const rowPassword = cellValue_(row, indexes.password);

    if (rowEmail === email) {
      if (!verifyPassword_(currentPassword, rowPassword)) {
        return { success: false, message: 'Current password is incorrect.' };
      }

      usersSheet.getRange(rowIndex + 1, indexes.password + 1).setValue(hashPassword_(newPassword));
      usersSheet.getRange(rowIndex + 1, indexes.firstLogin + 1).setValue(false);

      return { success: true, message: 'Password changed successfully.' };
    }
  }

  return { success: false, message: 'No account was found for that email address.' };
}

function listAuditLogs_(payload) {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const requestsSheet = spreadsheet.getSheetByName(REQUESTS_SHEET_NAME);

  if (!requestsSheet) {
    return {
      requests: [],
      sheetConfigured: false,
    };
  }

  const rows = requestsSheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return {
      requests: [],
      sheetConfigured: true,
    };
  }

  const headers = getHeaderMap_(rows[0]);
  const userFullnamesByEmail = getUserFullnamesByEmail_(spreadsheet);
  const branchNamesById = getBranchNamesById_(spreadsheet);
  const requests = rows
    .slice(1)
    .map(function(row, rowIndex) {
      return {
        request: enrichRequestBranch_(
          enrichRequestUser_(mapRequestRow_(row, headers), userFullnamesByEmail),
          branchNamesById,
        ),
        rowIndex: rowIndex,
      };
    })
    .filter(function(entry) {
      const request = entry.request;
      return request.requestId || request.memberName || request.status;
    })
    .sort(function(left, right) {
      return compareRequestsNewestFirst_(
        left.request,
        right.request,
        left.rowIndex,
        right.rowIndex,
      );
    })
    .map(function(entry) {
      return entry.request;
    });

  return {
    requests: requests,
    sheetConfigured: true,
  };
}

function compareRequestsNewestFirst_(leftRequest, rightRequest, leftIndex, rightIndex) {
  const requestedAtDelta =
    getRequestDateSortTime_(rightRequest.requestedAt) -
    getRequestDateSortTime_(leftRequest.requestedAt);

  if (requestedAtDelta !== 0) {
    return requestedAtDelta;
  }

  const requestIdDelta =
    getRequestIdSortTime_(rightRequest.requestId) -
    getRequestIdSortTime_(leftRequest.requestId);

  if (requestIdDelta !== 0) {
    return requestIdDelta;
  }

  return rightIndex - leftIndex;
}

function getRequestDateSortTime_(value) {
  const trimmed = String(value || '').trim();

  if (!trimmed) {
    return 0;
  }

  const parsed = new Date(trimmed).getTime();

  return isNaN(parsed) ? 0 : parsed;
}

function getRequestIdSortTime_(requestId) {
  const match = String(requestId || '').match(/^LR-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/);

  if (!match) {
    return 0;
  }

  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6]),
  ).getTime();
}

function listUsers_(payload) {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const usersSheet = spreadsheet.getSheetByName(USERS_SHEET_NAME);

  if (!usersSheet) {
    return {
      users: [],
      sheetConfigured: false,
    };
  }

  const rows = usersSheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return {
      users: [],
      sheetConfigured: true,
    };
  }

  const headers = getHeaderMap_(rows[0]);
  const branchNamesById = getBranchNamesById_(spreadsheet);
  const users = rows
    .slice(1)
    .map(function(row) {
      return mapUserRow_(row, headers, branchNamesById);
    })
    .filter(function(user) {
      return user.email;
    });

  return {
    users: users,
    sheetConfigured: true,
  };
}

function saveUser_(payload) {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const user = payload.user || {};
  const email = normalizeEmail_(user.email);
  const password = String(user.password || '').trim();
  const isNew = Boolean(user.isNew);

  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  if (isNew && !password) {
    return { success: false, message: 'Password is required for new users.' };
  }

  const usersSheet = getOrCreateSheet_(spreadsheet, USERS_SHEET_NAME, USER_HEADERS);
  const rows = usersSheet.getDataRange().getDisplayValues();
  const headers = rows.length ? getHeaderMap_(rows[0]) : {};
  const indexes = {
    email: firstHeaderIndex_(headers, ['email', 'user', 'username']),
    password: firstHeaderIndex_(headers, ['password']),
    role: firstHeaderIndex_(headers, ['role']),
    fullname: firstHeaderIndex_(headers, ['fullname', 'full name', 'name']),
    position: firstHeaderIndex_(headers, ['position']),
    branchid: firstHeaderIndex_(headers, ['branchid', 'branch_id', 'branch']),
    firstLogin: firstHeaderIndex_(headers, ['firstlogin', 'first_login', 'first login']),
  };
  const missingColumns = [];

  Object.keys(indexes).forEach(function(key) {
    if (indexes[key] === -1) {
      missingColumns.push(key === 'firstLogin' ? 'FirstLogin' : key);
    }
  });

  if (missingColumns.length) {
    return { success: false, message: 'Users sheet missing columns: ' + missingColumns.join(', ') };
  }

  let matchedRowNumber = -1;
  let existingRow = null;

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    if (normalizeEmail_(cellValue_(rows[rowIndex], indexes.email)) === email) {
      matchedRowNumber = rowIndex + 1;
      existingRow = rows[rowIndex];
      break;
    }
  }

  if (isNew && matchedRowNumber !== -1) {
    return { success: false, message: 'A user with that email already exists.' };
  }

  if (!isNew && matchedRowNumber === -1) {
    return { success: false, message: 'User not found.' };
  }

  const record = {
    email: email,
    role: String(user.role || '').trim(),
    fullname: String(user.fullname || '').trim(),
    position: String(user.position || '').trim(),
    branchid: String(user.branchid || '').trim(),
    firstlogin: parseBoolean_(user.firstLogin) || isNew,
  };

  if (password) {
    record.password = hashPassword_(password);
  }

  if (isNew) {
    appendRecord_(usersSheet, record);
  } else {
    updateRecord_(usersSheet, matchedRowNumber, record, existingRow);
  }

  return {
    success: true,
    message: isNew ? 'User added successfully.' : 'User updated successfully.',
  };
}

function getSettings_(payload) {
  return {
    approverSignature: getSettingValue_('approver_signature'),
  };
}

function updateSettings_(payload) {
  const settings = payload.settings || {};
  const approverSignature = String(settings.approverSignature || '').trim();

  setSettingValue_('approver_signature', approverSignature);

  return {
    success: true,
    message: 'Settings saved successfully.',
    approverSignature: approverSignature,
  };
}

function generateTemporaryPassword_() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function listRequests_(payload) {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const requestsSheet = spreadsheet.getSheetByName(REQUESTS_SHEET_NAME);

  if (!requestsSheet) {
    return {
      requests: [],
      sheetConfigured: false,
    };
  }

  const rows = requestsSheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return {
      requests: [],
      sheetConfigured: true,
    };
  }

  const headers = getHeaderMap_(rows[0]);
  const dashboard = String(payload.dashboard || '').trim().toLowerCase();
  const view = String(payload.view || 'pending').trim().toLowerCase();
  const email = normalizeEmail_(payload.email);
  const branchid = String(payload.branchid || '').trim();
  const userFullnamesByEmail = getUserFullnamesByEmail_(spreadsheet);
  const branchNamesById = getBranchNamesById_(spreadsheet);

  const requests = rows
    .slice(1)
    .map(function(row, rowIndex) {
      return {
        request: enrichRequestBranch_(
          enrichRequestUser_(mapRequestRow_(row, headers), userFullnamesByEmail),
          branchNamesById,
        ),
        rowIndex: rowIndex,
      };
    })
    .filter(function(entry) {
      const request = entry.request;
      return request.requestId || request.memberName || request.status;
    })
    .filter(function(entry) {
      return requestMatchesView_(entry.request, view, dashboard);
    })
    .filter(function(entry) {
      return requestMatchesDashboard_(entry.request, dashboard, email, branchid);
    })
    .sort(function(left, right) {
      return compareRequestsNewestFirst_(
        left.request,
        right.request,
        left.rowIndex,
        right.rowIndex,
      );
    })
    .map(function(entry) {
      return entry.request;
    });

  return {
    requests: requests,
    sheetConfigured: true,
  };
}

function getRequestDetails_(payload) {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const requestId = String(payload.requestId || payload.request_id || '').trim();

  if (!requestId) {
    throw new Error('Request ID is required.');
  }

  const requestsSheet = spreadsheet.getSheetByName(REQUESTS_SHEET_NAME);

  if (!requestsSheet) {
    throw new Error(`Sheet not found: ${REQUESTS_SHEET_NAME}`);
  }

  const match = findRequestById_(requestsSheet, requestId);

  if (!match.row) {
    throw new Error(`Request not found: ${requestId}`);
  }

  const request = mapRequestDetailRow_(match.row, match.headers);
  const branchNamesById = getBranchNamesById_(spreadsheet);
  const summary = enrichRequestUser_(
    mapRequestRow_(match.row, match.headers),
    getUserFullnamesByEmail_(spreadsheet),
  );
  enrichRequestBranch_(summary, branchNamesById);
  const otherLoans = getRelatedRows_(
    spreadsheet,
    OTHER_LOANS_SHEET_NAME,
    requestId,
    mapOtherLoanDetailRow_,
  );
  let comakers = getRelatedRows_(
    spreadsheet,
    COMAKERS_SHEET_NAME,
    requestId,
    mapComakerDetailRow_,
  );
  const securities = getRelatedRows_(
    spreadsheet,
    SECURITIES_SHEET_NAME,
    requestId,
    mapSecurityDetailRow_,
  );

  if (!comakers.length) {
    comakers = [
      request.comaker1,
      request.comaker2,
      request.comaker3,
      request.comaker4,
    ]
      .filter(function(fullname) {
        return String(fullname || '').trim();
      })
      .map(function(fullname) {
        return {
          fullname: fullname,
          loan_type: '',
          loan_amount: '',
          loan_balance: '',
          status: '',
        };
      });
  }

  return {
    request: request,
    otherLoans: otherLoans,
    comakers: comakers,
    securities: securities,
    status: summary.status,
    requestedBy: summary.requestedBy,
    requestedByName: summary.requestedByName,
    branchid: summary.branchid,
    branchName: summary.branchName,
    managerNotes: summary.managerNotes,
    approverNotes: summary.approverNotes,
    managerBy: summary.managerBy,
    managerByName: summary.managerByName,
    reviewAndRecommendations: summary.reviewAndRecommendations,
    dateOfApproval: summary.dateOfApproval,
    loanAmountApproved: summary.loanAmountApproved,
    additionalRequirements: summary.additionalRequirements,
  };
}

function createRequest_(payload) {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const request = payload.request || {};
  const otherLoans = Array.isArray(payload.otherLoans) ? payload.otherLoans : [];
  const comakers = Array.isArray(payload.comakers) ? payload.comakers : [];
  const securities = Array.isArray(payload.securities) ? payload.securities : [];
  const now = new Date();
  const requestId = String(request.request_id || buildRequestId_(now)).trim();
  const cifKey = String(request.cif_key || '').trim();
  const fullname = String(request.fullname || '').trim();

  if (!cifKey) {
    throw new Error('CIF key is required.');
  }

  if (!fullname) {
    throw new Error('Fullname is required.');
  }

  const requestSheet = getOrCreateSheet_(spreadsheet, REQUESTS_SHEET_NAME, REQUEST_HEADERS);
  const requestRecord = copyObject_(request);
  requestRecord.request_id = requestId;
  requestRecord.request_date = requestRecord.request_date || formatDate_(now);
  requestRecord.cif_key = cifKey;
  requestRecord.fullname = fullname;
  requestRecord.other_loans = String(otherLoans.length);
  requestRecord.status = requestRecord.status || 'Pending';
  requestRecord.requested_by = payload.createdBy || '';
  requestRecord.requested_by_name = payload.createdByName || '';
  requestRecord.branchid = payload.branchid || '';
  appendRecord_(requestSheet, requestRecord);

  const otherLoansSheet = getOrCreateSheet_(spreadsheet, OTHER_LOANS_SHEET_NAME, OTHER_LOANS_HEADERS);
  const savedOtherLoans = otherLoans
    .map(function(otherLoan) {
      return {
        request_id: requestId,
        cif_key: cifKey,
        loan_type: otherLoan.loan_type || '',
        loan_amount: otherLoan.loan_amount || '',
        balance: otherLoan.balance || '',
        status: otherLoan.status || '',
        analysis: otherLoan.analysis || '',
      };
    })
    .filter(function(otherLoan) {
      return otherLoan.loan_type || otherLoan.loan_amount || otherLoan.balance || otherLoan.status || otherLoan.analysis;
    });
  appendRecords_(otherLoansSheet, savedOtherLoans);

  const comakersSheet = getOrCreateSheet_(spreadsheet, COMAKERS_SHEET_NAME, COMAKERS_HEADERS);
  const savedComakers = comakers
    .slice(0, 4)
    .map(function(comaker) {
      return {
        request_id: requestId,
        cif_key: cifKey,
        fullname: String(comaker.fullname || comaker || '').trim(),
        loan_type: String(comaker.loan_type || '').trim(),
        loan_amount: String(comaker.loan_amount || '').trim(),
        loan_balance: String(comaker.loan_balance || '').trim(),
        status: String(comaker.status || '').trim(),
      };
    })
    .filter(function(comaker) {
      return comaker.fullname || comaker.loan_type || comaker.loan_amount || comaker.loan_balance || comaker.status;
    });
  appendRecords_(comakersSheet, savedComakers);

  const securitiesSheet = getOrCreateSheet_(spreadsheet, SECURITIES_SHEET_NAME, SECURITIES_HEADERS);
  const savedSecurities = securities
    .map(function(security) {
      return {
        request_id: requestId,
        nature: security.nature || '',
        market_value: security.market_value || '',
        appraised_value: security.appraised_value || '',
      };
    })
    .filter(function(security) {
      return security.nature || security.market_value || security.appraised_value;
    });
  appendRecords_(securitiesSheet, savedSecurities);

  return {
    requestId: requestId,
    requestDate: requestRecord.request_date,
    otherLoansSaved: savedOtherLoans.length,
    comakersSaved: savedComakers.length,
    securitiesSaved: savedSecurities.length,
  };
}

function updateRequest_(payload) {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const request = payload.request || {};
  const otherLoans = Array.isArray(payload.otherLoans) ? payload.otherLoans : [];
  const comakers = Array.isArray(payload.comakers) ? payload.comakers : [];
  const securities = Array.isArray(payload.securities) ? payload.securities : [];
  const requestId = String(request.request_id || payload.requestId || '').trim();
  const cifKey = String(request.cif_key || '').trim();
  const fullname = String(request.fullname || '').trim();

  if (!requestId) {
    throw new Error('Request ID is required.');
  }

  if (!cifKey) {
    throw new Error('CIF key is required.');
  }

  if (!fullname) {
    throw new Error('Fullname is required.');
  }

  const requestSheet = getOrCreateSheet_(spreadsheet, REQUESTS_SHEET_NAME, REQUEST_HEADERS);
  const match = findRequestById_(requestSheet, requestId);

  if (!match.row) {
    throw new Error(`Request not found: ${requestId}`);
  }

  const existingSummary = mapRequestRow_(match.row, match.headers);
  const requestRecord = copyObject_(request);
  const existingStatus = normalizeHeader_(existingSummary.status);
  requestRecord.request_id = requestId;
  requestRecord.request_date = requestRecord.request_date || formatDate_(new Date());
  requestRecord.cif_key = cifKey;
  requestRecord.fullname = fullname;
  requestRecord.other_loans = String(otherLoans.length);
  requestRecord.status = requestRecord.status || (existingStatus === 'returned' ? 'Pending' : existingSummary.status) || 'Pending';
  requestRecord.requested_by = requestRecord.requested_by || existingSummary.requestedBy || payload.createdBy || '';
  requestRecord.requested_by_name = requestRecord.requested_by_name || existingSummary.requestedByName || payload.createdByName || '';
  requestRecord.branchid = requestRecord.branchid || existingSummary.branchid || payload.branchid || '';
  updateRecord_(requestSheet, match.rowNumber, requestRecord, match.row);

  const otherLoansSheet = getOrCreateSheet_(spreadsheet, OTHER_LOANS_SHEET_NAME, OTHER_LOANS_HEADERS);
  deleteRowsMatchingRequestId_(otherLoansSheet, requestId);
  const savedOtherLoans = otherLoans
    .map(function(otherLoan) {
      return {
        request_id: requestId,
        cif_key: cifKey,
        loan_type: otherLoan.loan_type || '',
        loan_amount: otherLoan.loan_amount || '',
        balance: otherLoan.balance || '',
        status: otherLoan.status || '',
        analysis: otherLoan.analysis || '',
      };
    })
    .filter(function(otherLoan) {
      return otherLoan.loan_type || otherLoan.loan_amount || otherLoan.balance || otherLoan.status || otherLoan.analysis;
    });
  appendRecords_(otherLoansSheet, savedOtherLoans);

  const comakersSheet = getOrCreateSheet_(spreadsheet, COMAKERS_SHEET_NAME, COMAKERS_HEADERS);
  deleteRowsMatchingRequestId_(comakersSheet, requestId);
  const savedComakers = comakers
    .slice(0, 4)
    .map(function(comaker) {
      return {
        request_id: requestId,
        cif_key: cifKey,
        fullname: String(comaker.fullname || comaker || '').trim(),
        loan_type: String(comaker.loan_type || '').trim(),
        loan_amount: String(comaker.loan_amount || '').trim(),
        loan_balance: String(comaker.loan_balance || '').trim(),
        status: String(comaker.status || '').trim(),
      };
    })
    .filter(function(comaker) {
      return comaker.fullname || comaker.loan_type || comaker.loan_amount || comaker.loan_balance || comaker.status;
    });
  appendRecords_(comakersSheet, savedComakers);

  const securitiesSheet = getOrCreateSheet_(spreadsheet, SECURITIES_SHEET_NAME, SECURITIES_HEADERS);
  deleteRowsMatchingRequestId_(securitiesSheet, requestId);
  const savedSecurities = securities
    .map(function(security) {
      return {
        request_id: requestId,
        nature: security.nature || '',
        market_value: security.market_value || '',
        appraised_value: security.appraised_value || '',
      };
    })
    .filter(function(security) {
      return security.nature || security.market_value || security.appraised_value;
    });
  appendRecords_(securitiesSheet, savedSecurities);

  return {
    requestId: requestId,
    requestDate: requestRecord.request_date,
    otherLoansSaved: savedOtherLoans.length,
    comakersSaved: savedComakers.length,
    securitiesSaved: savedSecurities.length,
    updated: true,
  };
}

function forwardRequest_(payload) {
  const requestId = String(payload.requestId || payload.request_id || '').trim();
  const notes = String(payload.notes || payload.manager_notes || '').trim();
  const managerBy = String(payload.managerBy || payload.manager_by || payload.forwardedBy || payload.forwarded_by || '').trim();
  const managerByName = String(payload.managerByName || payload.manager_by_name || payload.forwardedByName || payload.forwarded_by_name || '').trim();

  if (!requestId) {
    throw new Error('Request ID is required.');
  }

  return updateRequestStatus_(requestId, 'Forwarded', notes, ['pending', 'returnedtomanager'], 'forwarded', '', managerBy, managerByName);
}

function returnRequest_(payload) {
  const requestId = String(payload.requestId || payload.request_id || '').trim();
  const notes = String(payload.notes || payload.manager_notes || '').trim();

  if (!requestId) {
    throw new Error('Request ID is required.');
  }

  if (!notes) {
    throw new Error('Notes are required before returning a request to the teller.');
  }

  return updateRequestStatus_(requestId, 'Returned', notes, ['pending', 'returnedtomanager'], 'returned');
}

function approveRequest_(payload) {
  const requestId = String(payload.requestId || payload.request_id || '').trim();

  if (!requestId) {
    throw new Error('Request ID is required.');
  }

  return updateRequestStatus_(
    requestId,
    'Approved',
    '',
    ['forwarded'],
    'approved',
    '',
    '',
    '',
    getApprovalDetails_(payload),
  );
}

function disapproveRequest_(payload) {
  const requestId = String(payload.requestId || payload.request_id || '').trim();

  if (!requestId) {
    throw new Error('Request ID is required.');
  }

  return updateRequestStatus_(
    requestId,
    'Disapproved',
    '',
    ['forwarded'],
    'disapproved',
    '',
    '',
    '',
    getApprovalDetails_(payload),
  );
}

function returnToManager_(payload) {
  const requestId = String(payload.requestId || payload.request_id || '').trim();
  const notes = String(payload.notes || payload.approver_notes || '').trim();

  if (!requestId) {
    throw new Error('Request ID is required.');
  }

  if (!notes) {
    throw new Error('Notes are required before returning a request to the branch manager.');
  }

  return updateRequestStatus_(requestId, 'Returned to Manager', '', ['forwarded'], 'returned to branch manager', notes);
}

function updateRequestStatus_(requestId, nextStatus, notes, allowedStatuses, actionLabel, approverNotes, managerBy, managerByName, approvalDetails) {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const requestSheet = getOrCreateSheet_(spreadsheet, REQUESTS_SHEET_NAME, REQUEST_HEADERS);
  const match = findRequestById_(requestSheet, requestId);

  if (!match.row) {
    throw new Error(`Request not found: ${requestId}`);
  }

  const summary = mapRequestRow_(match.row, match.headers);
  const status = normalizeHeader_(summary.status);

  if (allowedStatuses.indexOf(status) === -1) {
    throw new Error(`This request cannot be ${actionLabel}. Current status: ${summary.status || 'Unknown'}`);
  }

  updateRecord_(requestSheet, match.rowNumber, {
    status: nextStatus,
    manager_notes: notes || summary.managerNotes || '',
    approver_notes: approverNotes || summary.approverNotes || '',
    manager_by: managerBy || summary.managerBy || '',
    manager_by_name: managerByName || summary.managerByName || '',
    review_and_recommendations:
      approvalDetails && approvalDetails.reviewAndRecommendations
        ? approvalDetails.reviewAndRecommendations
        : summary.reviewAndRecommendations || '',
    date_of_approval:
      approvalDetails && approvalDetails.dateOfApproval
        ? approvalDetails.dateOfApproval
        : summary.dateOfApproval || '',
    loan_amount_approved:
      approvalDetails && approvalDetails.loanAmountApproved
        ? approvalDetails.loanAmountApproved
        : summary.loanAmountApproved || '',
    additional_requirements:
      approvalDetails && approvalDetails.additionalRequirements
        ? approvalDetails.additionalRequirements
        : summary.additionalRequirements || '',
  }, match.row);

  return {
    requestId: requestId,
    status: nextStatus,
    managerNotes: notes || summary.managerNotes || '',
    approverNotes: approverNotes || summary.approverNotes || '',
    managerBy: managerBy || summary.managerBy || '',
    managerByName: managerByName || summary.managerByName || '',
    reviewAndRecommendations:
      approvalDetails && approvalDetails.reviewAndRecommendations
        ? approvalDetails.reviewAndRecommendations
        : summary.reviewAndRecommendations || '',
    dateOfApproval:
      approvalDetails && approvalDetails.dateOfApproval
        ? approvalDetails.dateOfApproval
        : summary.dateOfApproval || '',
    loanAmountApproved:
      approvalDetails && approvalDetails.loanAmountApproved
        ? approvalDetails.loanAmountApproved
        : summary.loanAmountApproved || '',
    additionalRequirements:
      approvalDetails && approvalDetails.additionalRequirements
        ? approvalDetails.additionalRequirements
        : summary.additionalRequirements || '',
  };
}

function getApprovalDetails_(payload) {
  return {
    reviewAndRecommendations: String(
      payload.reviewAndRecommendations ||
        payload.review_and_recommendations ||
        payload.reviewRecommendations ||
        payload.review_recommendations ||
        '',
    ).trim(),
    dateOfApproval: String(
      payload.dateOfApproval || payload.date_of_approval || payload.approvalDate || payload.approval_date || '',
    ).trim(),
    loanAmountApproved: String(
      payload.loanAmountApproved || payload.loan_amount_approved || payload.approvedAmount || payload.approved_amount || '',
    ).trim(),
    additionalRequirements: String(
      payload.additionalRequirements || payload.additional_requirements || payload.requirements || '',
    ).trim(),
  };
}

function searchMembers_(payload) {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const masterListSheet = spreadsheet.getSheetByName(MASTERLIST_SHEET_NAME);

  if (!masterListSheet) {
    return {
      members: [],
      sheetConfigured: false,
    };
  }

  const query = String(payload.query || '').trim().toLowerCase();

  if (!query) {
    return {
      members: [],
      sheetConfigured: true,
    };
  }

  const lastRow = masterListSheet.getLastRow();
  const lastColumn = masterListSheet.getLastColumn();

  if (lastRow < 2) {
    return {
      members: [],
      sheetConfigured: true,
    };
  }

  const rows = masterListSheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues();
  const headers = getHeaderMap_(rows[0]);

  const members = rows
    .slice(1)
    .map(function(row) {
      return mapMemberRow_(row, headers);
    })
    .filter(function(member) {
      return member && member.client_name && member.client_name.toLowerCase().indexOf(query) !== -1;
    })
    .slice(0, 10);

  return {
    members: members,
    sheetConfigured: true,
  };
}

function getLoanTypes_(payload) {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const loanTypeSheet = spreadsheet.getSheetByName(LOANTYPE_SHEET_NAME);

  if (!loanTypeSheet) {
    return {
      loanTypes: [],
      sheetConfigured: false,
    };
  }

  const rows = loanTypeSheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return {
      loanTypes: [],
      sheetConfigured: true,
    };
  }

  const headers = getHeaderMap_(rows[0]);
  const loanTypes = rows
    .slice(1)
    .map(function(row) {
      const loantype = cellByAliases_(row, headers, ['loantype', 'loan_type', 'type']);
      return {
        loan_id: cellByAliases_(row, headers, ['loan_id', 'loanid', 'id']),
        loantype: loantype,
        description: cellByAliases_(row, headers, ['description']),
      };
    })
    .filter(function(loanType) {
      return loanType.loantype;
    });

  return {
    loanTypes: loanTypes,
    sheetConfigured: true,
  };
}

function getComakerLoans_(payload) {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  const cifKey = String(payload.cif_key || '').trim();

  if (!cifKey) {
    return {
      loans: [],
    };
  }

  const otherLoansSheet = spreadsheet.getSheetByName(OTHER_LOANS_SHEET_NAME);

  if (!otherLoansSheet) {
    return {
      loans: [],
    };
  }

  const rows = otherLoansSheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return {
      loans: [],
    };
  }

  const headers = getHeaderMap_(rows[0]);
  const loans = rows
    .slice(1)
    .map(function(row) {
      return {
        loan_type: cellByAliases_(row, headers, ['loan_type', 'loantype']),
        loan_amount: cellByAliases_(row, headers, ['loan_amount', 'loanamount']),
        balance: cellByAliases_(row, headers, ['balance']),
        status: cellByAliases_(row, headers, ['status']),
      };
    })
    .filter(function(loan) {
      return loan.loan_type;
    });

  return {
    loans: loans,
  };
}

function mapRequestDetailRow_(row, headers) {
  return {
    request_id: cellByAliases_(row, headers, ['request_id', 'requestid', 'id', 'loanid']),
    request_date: cellByAliases_(row, headers, ['request_date', 'requestedat', 'requestdate', 'datecreated', 'createdat']),
    cif_key: cellByAliases_(row, headers, ['cif_key', 'cifkey', 'cif', 'memberid']),
    fullname: cellByAliases_(row, headers, ['fullname', 'membername', 'clientname', 'borrower']),
    address: cellByAliases_(row, headers, ['address']),
    age: cellByAliases_(row, headers, ['age']),
    share_capital: cellByAliases_(row, headers, ['share_capital', 'sharecapital']),
    date_of_retirement: cellByAliases_(row, headers, ['date_of_retirement', 'dateofretirement', 'retirementdate']),
    loan_type: cellByAliases_(row, headers, ['loan_type', 'loantype', 'product', 'loanproduct']),
    amount_applied: cellByAliases_(row, headers, ['amount_applied', 'amount', 'loanamount', 'principal']),
    loan_balance: cellByAliases_(row, headers, ['loan_balance', 'loanbalance', 'balance']),
    other_loans: cellByAliases_(row, headers, ['other_loans', 'otherloans']),
    employer: cellByAliases_(row, headers, ['employer']),
    position: cellByAliases_(row, headers, ['position']),
    employers_address: cellByAliases_(row, headers, ['employers_address', 'employersaddress', 'employer_address', 'employeraddress']),
    monthly_pension: cellByAliases_(row, headers, ['monthly_pension', 'monthlypension', 'pension']),
    current_nthp: cellByAliases_(row, headers, ['current_nthp', 'currentnthp']),
    analysis_nthp: cellByAliases_(row, headers, ['analysis_nthp', 'analysisnthp']),
    comaker1: cellByAliases_(row, headers, ['comaker1', 'co_maker1']),
    comaker2: cellByAliases_(row, headers, ['comaker2', 'co_maker2']),
    comaker3: cellByAliases_(row, headers, ['comaker3', 'co_maker3']),
    comaker4: cellByAliases_(row, headers, ['comaker4', 'co_maker4']),
    appraisal_result: cellByAliases_(row, headers, ['appraisal_result', 'appraisalresult']),
    recommendation: cellByAliases_(row, headers, ['recommendation']),
  };
}

function mapOtherLoanDetailRow_(row, headers) {
  return {
    loan_type: cellByAliases_(row, headers, ['loan_type', 'loantype']),
    loan_amount: cellByAliases_(row, headers, ['loan_amount', 'loanamount']),
    balance: cellByAliases_(row, headers, ['balance']),
    status: cellByAliases_(row, headers, ['status']),
    analysis: cellByAliases_(row, headers, ['analysis']),
  };
}

function mapComakerDetailRow_(row, headers) {
  return {
    fullname: cellByAliases_(row, headers, ['fullname', 'membername', 'clientname', 'borrower']),
    loan_type: cellByAliases_(row, headers, ['loan_type', 'loantype']),
    loan_amount: cellByAliases_(row, headers, ['loan_amount', 'loanamount']),
    loan_balance: cellByAliases_(row, headers, ['loan_balance', 'loanbalance', 'balance']),
    status: cellByAliases_(row, headers, ['status']),
  };
}

function mapSecurityDetailRow_(row, headers) {
  return {
    nature: cellByAliases_(row, headers, ['nature', 'security', 'collateral']),
    market_value: cellByAliases_(row, headers, ['market_value', 'marketvalue']),
    appraised_value: cellByAliases_(row, headers, ['appraised_value', 'appraisedvalue']),
  };
}

function mapMemberRow_(row, headers) {
  return {
    cif_key: cellByAliases_(row, headers, ['cif_key', 'cifkey', 'cif', 'memberid']),
    client_name: cellByAliases_(row, headers, ['client_name', 'clientname', 'fullname', 'membername', 'name']),
    membership_date: cellByAliases_(row, headers, ['membership_date', 'membershipdate', 'joindate']),
    membership_type: cellByAliases_(row, headers, ['membership_type', 'membershiptype', 'type']),
    sex: cellByAliases_(row, headers, ['sex', 'gender']),
    age: cellByAliases_(row, headers, ['age']),
    birthdate: cellByAliases_(row, headers, ['birthdate', 'dob', 'dateofbirth']),
    contactnumber: cellByAliases_(row, headers, ['contactnumber', 'contact', 'phone', 'mobilenumber']),
    address: cellByAliases_(row, headers, ['address']),
    branch_id: cellByAliases_(row, headers, ['branch_id', 'branchid', 'branch']),
    status: cellByAliases_(row, headers, ['status']),
    tin_number: cellByAliases_(row, headers, ['tin_number', 'tinnumber', 'tin']),
    occupation: cellByAliases_(row, headers, ['occupation']),
    educational_attainment: cellByAliases_(row, headers, ['educational_attainment', 'educationalattainment', 'education']),
  };
}

function mapUserRow_(row, headers, branchNamesById) {
  const branchid = cellByAliases_(row, headers, ['branchid', 'branch_id', 'branch']);

  return {
    email: cellByAliases_(row, headers, ['email', 'user', 'username']),
    role: cellByAliases_(row, headers, ['role']),
    fullname: cellByAliases_(row, headers, ['fullname', 'full name', 'name']),
    position: cellByAliases_(row, headers, ['position']),
    branchid: branchid,
    branchName: getBranchName_(branchNamesById, branchid),
    firstLogin: parseBoolean_(cellByAliases_(row, headers, ['firstlogin', 'first_login', 'first login'])),
  };
}

function mapRequestRow_(row, headers) {
  const recommendation = cellByAliases_(row, headers, ['recommendation']);
  const rawStatus = cellByAliases_(row, headers, ['status', 'requeststatus']);
  const recommendationStatus = ['pending', 'forwarded', 'returned', 'returnedtomanager', 'approved', 'disapproved', 'rejected'].indexOf(normalizeHeader_(recommendation)) !== -1
    ? recommendation
    : '';
  const status = rawStatus || recommendationStatus || 'Pending';

  return {
    requestId: cellByAliases_(row, headers, ['requestid', 'request_id', 'id', 'loanid']),
    memberName: cellByAliases_(row, headers, ['fullname', 'membername', 'clientname', 'borrower']),
    loanType: cellByAliases_(row, headers, ['loan_type', 'loantype', 'product', 'loanproduct']),
    amount: cellByAliases_(row, headers, ['amount_applied', 'amount', 'loanamount', 'principal']),
    status: status,
    requestedAt: cellByAliases_(row, headers, ['request_date', 'requestedat', 'requestdate', 'datecreated', 'createdat']),
    decidedAt: cellByAliases_(row, headers, ['decidedat', 'decisiondate', 'updatedat']),
    requestedBy: cellByAliases_(row, headers, ['requested_by', 'requestedby', 'createdby', 'telleremail', 'email']),
    requestedByName: cellByAliases_(row, headers, ['requested_by_name', 'requestedbyname', 'createdbyname', 'tellername']),
    branchid: cellByAliases_(row, headers, ['branchid', 'branch', 'branchcode']),
    remarks: recommendation || cellByAliases_(row, headers, ['remarks', 'reason']),
    managerNotes: cellByAliases_(row, headers, ['manager_notes', 'managernotes', 'notes', 'managerremarks']),
    approverNotes: cellByAliases_(row, headers, ['approver_notes', 'approvernotes', 'approverremarks']),
    managerBy: cellByAliases_(row, headers, ['manager_by', 'managerby', 'forwardedby', 'forwarded_by', 'manageremail']),
    managerByName: cellByAliases_(row, headers, ['manager_by_name', 'managerbyname', 'forwardedbyname', 'forwarded_by_name', 'managername']),
    reviewAndRecommendations: cellByAliases_(row, headers, ['review_and_recommendations', 'reviewandrecommendations', 'review_recommendations', 'reviewrecommendations']),
    dateOfApproval: cellByAliases_(row, headers, ['date_of_approval', 'dateofapproval', 'approval_date', 'approvaldate']),
    loanAmountApproved: cellByAliases_(row, headers, ['loan_amount_approved', 'loanamountapproved', 'approved_amount', 'approvedamount']),
    additionalRequirements: cellByAliases_(row, headers, ['additional_requirements', 'additionalrequirements', 'requirements']),
  };
}

function requestMatchesView_(request, view, dashboard) {
  const status = normalizeHeader_(request.status);

  if (view === 'history') {
    return status === 'approved' || status === 'disapproved' || status === 'rejected';
  }

  if (dashboard === 'approver') {
    return status === 'forwarded';
  }

  if (dashboard === 'teller') {
    return status === 'pending' || status === 'returned';
  }

  if (dashboard === 'manager') {
    return status === 'pending' || status === 'returnedtomanager';
  }

  return status === 'pending';
}

function requestMatchesDashboard_(request, dashboard, email, branchid) {
  const requestOwner = normalizeEmail_(request.requestedBy);
  const requestBranch = normalizeBranchId_(request.branchid);
  const userBranch = normalizeBranchId_(branchid);

  if (dashboard === 'teller') {
    return Boolean(email) && requestOwner === email;
  }

  if (dashboard === 'manager') {
    return Boolean(userBranch) && requestBranch === userBranch;
  }

  return true;
}

function getHeaderMap_(headerRow) {
  const headers = {};

  for (let index = 0; index < headerRow.length; index += 1) {
    const key = normalizeHeader_(headerRow[index]);

    if (key) {
      headers[key] = index;
    }
  }

  return headers;
}

function requireColumns_(headers, requiredColumns) {
  const missingColumns = [];

  for (let index = 0; index < requiredColumns.length; index += 1) {
    const column = requiredColumns[index];

    if (typeof headers[column] === 'undefined') {
      missingColumns.push(column);
    }
  }

  if (missingColumns.length) {
    throw new Error(`Users sheet missing columns: ${missingColumns.join(', ')}`);
  }
}

function getUserFullnamesByEmail_(spreadsheet) {
  const usersSheet = spreadsheet.getSheetByName(USERS_SHEET_NAME);
  const fullnamesByEmail = {};

  if (!usersSheet) {
    return fullnamesByEmail;
  }

  const rows = usersSheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return fullnamesByEmail;
  }

  const headers = getHeaderMap_(rows[0]);

  if (typeof headers.email === 'undefined' || typeof headers.fullname === 'undefined') {
    return fullnamesByEmail;
  }

  rows.slice(1).forEach(function(row) {
    const email = normalizeEmail_(cellValue_(row, headers.email));
    const fullname = cellValue_(row, headers.fullname);

    if (email && fullname) {
      fullnamesByEmail[email] = fullname;
    }
  });

  return fullnamesByEmail;
}

function getBranchNamesById_(spreadsheet) {
  const branchesSheet = getBranchesSheet_(spreadsheet);
  const branchNamesById = {};

  if (!branchesSheet) {
    return branchNamesById;
  }

  const rows = branchesSheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return branchNamesById;
  }

  const headers = getHeaderMap_(rows[0]);
  const branchIdColumn = firstHeaderIndex_(headers, ['branchid', 'branch_id', 'branch code', 'branchcode', 'id']);
  const branchNameColumn = firstHeaderIndex_(headers, ['branchname', 'branch_name', 'branch name', 'name']);

  if (branchIdColumn === -1 || branchNameColumn === -1) {
    return branchNamesById;
  }

  rows.slice(1).forEach(function(row) {
    const branchid = normalizeBranchId_(cellValue_(row, branchIdColumn));
    const branchName = cellValue_(row, branchNameColumn);

    if (branchid && branchName) {
      branchNamesById[branchid] = branchName;
    }
  });

  return branchNamesById;
}

function getBranchesSheet_(spreadsheet) {
  return getSheetByNameLoose_(spreadsheet, BRANCHES_SHEET_NAME, ['Branches', 'BranchList', 'Branch List']);
}

function getSettingsSheet_() {
  const spreadsheet = getSpreadsheet_();

  if (!spreadsheet) {
    throw new Error('No spreadsheet is connected to the Apps Script project.');
  }

  return getOrCreateSheet_(spreadsheet, SETTINGS_SHEET_NAME, SETTINGS_HEADERS);
}

function getSettingValue_(key) {
  const settingsSheet = getSettingsSheet_();
  const rows = settingsSheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return '';
  }

  const headers = getHeaderMap_(rows[0]);
  const keyColumn = firstHeaderIndex_(headers, ['key', 'name', 'setting']);
  const valueColumn = firstHeaderIndex_(headers, ['value', 'settingvalue', 'setting_value']);

  if (keyColumn === -1 || valueColumn === -1) {
    return '';
  }

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    if (normalizeHeader_(cellValue_(rows[rowIndex], keyColumn)) === normalizeHeader_(key)) {
      return cellValue_(rows[rowIndex], valueColumn);
    }
  }

  return '';
}

function setSettingValue_(key, value) {
  const settingsSheet = getSettingsSheet_();
  const rows = settingsSheet.getDataRange().getDisplayValues();
  const headers = rows.length ? getHeaderMap_(rows[0]) : {};
  const keyColumn = firstHeaderIndex_(headers, ['key', 'name', 'setting']);
  const valueColumn = firstHeaderIndex_(headers, ['value', 'settingvalue', 'setting_value']);

  if (keyColumn === -1 || valueColumn === -1) {
    throw new Error('Settings sheet missing columns: key, value');
  }

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    if (normalizeHeader_(cellValue_(rows[rowIndex], keyColumn)) === normalizeHeader_(key)) {
      settingsSheet.getRange(rowIndex + 1, valueColumn + 1).setValue(value);
      return;
    }
  }

  const record = {};
  record[SETTINGS_HEADERS[0]] = key;
  record[SETTINGS_HEADERS[1]] = value;
  appendRecord_(settingsSheet, record);
}

function getSheetByNameLoose_(spreadsheet, sheetName, aliases) {
  const directMatch = spreadsheet.getSheetByName(sheetName);

  if (directMatch) {
    return directMatch;
  }

  const allowedNames = [sheetName].concat(aliases || []).map(normalizeHeader_);
  const sheets = spreadsheet.getSheets();

  for (let index = 0; index < sheets.length; index += 1) {
    const normalizedSheetName = normalizeHeader_(sheets[index].getName());

    if (allowedNames.indexOf(normalizedSheetName) !== -1) {
      return sheets[index];
    }
  }

  return null;
}

function getBranchName_(branchNamesById, branchid) {
  const normalizedBranchId = normalizeBranchId_(branchid);

  return branchNamesById[normalizedBranchId] || String(branchid || '').trim();
}

function enrichRequestUser_(request, fullnamesByEmail) {
  if (!request.requestedByName) {
    request.requestedByName = fullnamesByEmail[normalizeEmail_(request.requestedBy)] || request.requestedBy;
  }

  if (!request.managerByName) {
    request.managerByName = fullnamesByEmail[normalizeEmail_(request.managerBy)] || request.managerBy;
  }

  return request;
}

function enrichRequestBranch_(request, branchNamesById) {
  request.branchName = getBranchName_(branchNamesById, request.branchid);

  return request;
}

function normalizeHeader_(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeBranchId_(value) {
  return String(value || '').trim().toLowerCase();
}

function cellValue_(row, index) {
  return String(row[index] || '').trim();
}

function cellByAliases_(row, headers, aliases) {
  for (let index = 0; index < aliases.length; index += 1) {
    const key = normalizeHeader_(aliases[index]);

    if (typeof headers[key] !== 'undefined') {
      return cellValue_(row, headers[key]);
    }
  }

  return '';
}

function firstHeaderIndex_(headers, aliases) {
  for (let index = 0; index < aliases.length; index += 1) {
    const key = normalizeHeader_(aliases[index]);

    if (typeof headers[key] !== 'undefined') {
      return headers[key];
    }
  }

  return -1;
}

function rowHasValues_(record) {
  return Object.keys(record).some(function(key) {
    return String(record[key] || '').trim();
  });
}

function findRequestById_(sheet, requestId) {
  const rows = sheet.getDataRange().getDisplayValues();
  const headers = rows.length ? getHeaderMap_(rows[0]) : {};
  const requestIdColumn = firstHeaderIndex_(headers, ['request_id', 'requestid', 'id', 'loanid']);

  if (requestIdColumn === -1) {
    throw new Error(`Sheet ${sheet.getName()} is missing a request_id column.`);
  }

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    if (cellValue_(rows[rowIndex], requestIdColumn) === requestId) {
      return {
        row: rows[rowIndex],
        rowNumber: rowIndex + 1,
        headers: headers,
      };
    }
  }

  return {
    row: null,
    rowNumber: -1,
    headers: headers,
  };
}

function getRelatedRows_(spreadsheet, sheetName, requestId, mapper) {
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    return [];
  }

  const rows = sheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return [];
  }

  const headers = getHeaderMap_(rows[0]);
  const requestIdColumn = firstHeaderIndex_(headers, ['request_id', 'requestid', 'id', 'loanid']);

  if (requestIdColumn === -1) {
    return [];
  }

  return rows
    .slice(1)
    .filter(function(row) {
      return cellValue_(row, requestIdColumn) === requestId;
    })
    .map(function(row) {
      return mapper(row, headers);
    })
    .filter(rowHasValues_);
}

function deleteRowsMatchingRequestId_(sheet, requestId) {
  const rows = sheet.getDataRange().getDisplayValues();

  if (rows.length < 2) {
    return;
  }

  const headers = getHeaderMap_(rows[0]);
  const requestIdColumn = firstHeaderIndex_(headers, ['request_id', 'requestid', 'id', 'loanid']);

  if (requestIdColumn === -1) {
    return;
  }

  for (let rowIndex = rows.length - 1; rowIndex >= 1; rowIndex -= 1) {
    if (cellValue_(rows[rowIndex], requestIdColumn) === requestId) {
      sheet.deleteRow(rowIndex + 1);
    }
  }
}

function getOrCreateSheet_(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  const range = sheet.getDataRange();
  const values = range.getNumRows() ? range.getDisplayValues() : [];
  const hasHeader = values.length && values[0].some(function(value) {
    return String(value || '').trim();
  });

  if (!hasHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    ensureHeaders_(sheet, headers);
  }

  return sheet;
}

function ensureHeaders_(sheet, expectedHeaders) {
  const lastColumn = sheet.getLastColumn();

  if (!lastColumn) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    return;
  }

  const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  const headerMap = getHeaderMap_(headers);
  const missingHeaders = expectedHeaders.filter(function(header) {
    return typeof headerMap[normalizeHeader_(header)] === 'undefined';
  });

  if (!missingHeaders.length) {
    return;
  }

  sheet
    .getRange(1, lastColumn + 1, 1, missingHeaders.length)
    .setValues([missingHeaders]);
}

function appendRecord_(sheet, record) {
  appendRecords_(sheet, [record]);
}

function appendRecords_(sheet, records) {
  if (!records.length) {
    return;
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const rows = records.map(function(record) {
    return buildRowFromRecord_(headers, record);
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
}

function updateRecord_(sheet, rowNumber, record, existingRow) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const row = buildRowFromRecord_(headers, record, existingRow);
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
}

function buildRowFromRecord_(headers, record, existingRow) {
  return headers.map(function(header, index) {
    const value = getRecordValue_(record, header);

    if (value.found) {
      return value.value;
    }

    return existingRow ? existingRow[index] || '' : '';
  });
}

function getRecordValue_(record, header) {
  const rawKey = String(header || '').trim();
  const key = normalizeHeader_(header);
  const lowerKey = rawKey.toLowerCase();

  if (typeof record[key] !== 'undefined') {
    return {
      found: true,
      value: record[key],
    };
  }

  if (typeof record[rawKey] !== 'undefined') {
    return {
      found: true,
      value: record[rawKey],
    };
  }

  if (typeof record[lowerKey] !== 'undefined') {
    return {
      found: true,
      value: record[lowerKey],
    };
  }

  return {
    found: false,
    value: '',
  };
}

function buildRequestId_(date) {
  return 'LR-' + Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
}

function formatDate_(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function copyObject_(value) {
  const result = {};

  Object.keys(value || {}).forEach(function(key) {
    result[normalizeHeader_(key)] = value[key];
  });

  return result;
}

function parseBoolean_(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return ['true', 'yes', 'y', '1'].indexOf(normalized) !== -1;
}

function getErrorMessage_(error) {
  if (error && error.message) {
    return error.message;
  }

  return String(error || 'Unknown error');
}

function getSpreadsheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (error) {
    return null;
  }
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
