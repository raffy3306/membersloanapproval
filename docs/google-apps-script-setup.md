# Google Apps Script Setup

The app is configured with this Apps Script ID:

```text
1LzcA9-TEl5N434UaGD88c4NdxajmJ8lvvbbEB1lNUZs
```

To make the browser app connect:

1. Open the Apps Script project.
2. Paste `apps-script/Code.gs` into the project.
3. Deploy it as a Web app.
4. Copy the Web app `/exec` URL.
5. Put that URL in `.env.local`:

```text
VITE_GOOGLE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

If the script is not bound to a spreadsheet, set a Script Property named `SPREADSHEET_ID` with the spreadsheet ID that should store members and loan approvals.

## Users Sheet

Create a sheet named `Users` with these exact headers in the first row:

```text
email	password	role	fullname	position	branchid	FirstLogin
```

The login API checks the submitted email and password against this sheet. It returns the user profile fields to the browser, but it never returns the password.

## Dashboard Pages

The app has these dashboard entry pages:

```text
teller.html
manager.html
approver.html
```

After login, users are routed by `role` or `position`:

```text
teller -> teller.html
branch_manager -> manager.html
approver -> approver.html
```

## Loan Request Sheet

Create a sheet named `LoanRequest` for the main request rows:

```text
request_id	request_date	cif_key	fullname	address	age	share_capital	date_of_retirement	loan_type	amount_applied	loan_balance	other_loans	employer	position	employers_address	monthly_pension	current_nthp	analysis_nthp	comaker1	comaker2	comaker3	comaker4	appraisal_result	recommendation	status	requested_by	requested_by_name	branchid	manager_notes	approver_notes	manager_by	manager_by_name	review_and_recommendations	date_of_approval	loan_amount_approved	additional_requirements
```

For the teller dashboard:

```text
My Request -> status is Pending
Returned requests also appear here so the teller can read manager notes and revise the request.
Request History -> status is Approved or Disapproved
```

For the branch manager dashboard:

```text
Branch Requests -> status is Pending for the manager's branch
Requests returned by the approver also appear here with status Returned to Manager
Forward for Approval -> changes status to Forwarded
Return to Teller -> changes status to Returned and saves manager_notes
```

For the Savings and Credit Head dashboard:

```text
For Approval -> status is Forwarded
Approve -> changes status to Approved and saves approval details
Disapproved -> changes status to Disapproved and saves review/additional requirement details
Return to Branch Manager -> changes status to Returned to Manager and saves approver_notes
Approval History -> status is Approved or Disapproved
```

Newly created requests are saved as `Pending` in the app. The `status`, `requested_by`, `requested_by_name`, and `branchid` columns are used for dashboard filtering, display, and history views. The `manager_notes` column stores notes from the manager that can be read by the teller. The `approver_notes` column stores notes from the approver that can be read by the branch manager and teller. The `manager_by` and `manager_by_name` columns store the branch manager who forwarded the request so the report can show the teller under `Prepared By` and the manager under `Noted By`. The `review_and_recommendations`, `date_of_approval`, `loan_amount_approved`, and `additional_requirements` columns store the Savings and Credit Head approval details shown in the final approval section of the report.

New teller requests are saved through the `createRequest` Apps Script action. Existing teller requests are updated through the `updateRequest` action. When a teller updates a returned request, its status goes back to `Pending`. Managers forward requests through the `forwardRequest` action and return requests through the `returnRequest` action. Approvers use `approveRequest`, `disapproveRequest`, and `returnToManager`. The app writes the main request to `LoanRequest`, other loan rows to `OtherLoans`, comakers to `Comakers`, and collateral to `Securities`.

Create a sheet named `OtherLoans` with these headers:

```text
request_id	cif_key	loan_type	loan_amount	balance	status	analysis
```

Create a sheet named `Comakers` with these headers:

```text
request_id	cif_key	fullname	loan_type	loan_amount	loan_balance	status
```

Create a sheet named `Securities` with these headers:

```text
request_id	nature	market_value	appraised_value
```

If any of these detail sheets are missing, the Apps Script backend will create them with the headers above when a teller saves a request.
