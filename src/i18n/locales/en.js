export default {
  meta: {
    name: 'English',
    htmlLang: 'en',
    title: 'Focus10 — Focus on what matters',
    description:
      'Focus10 is a task and timer tool for freelancers who track their own hours. Weekly reports and CSV export.',
  },

  common: {
    close: 'Close',
    cancel: 'Cancel',
    back: 'Back',
    loading: 'Loading…',
    skipToContent: 'Skip to main content',
    dismissToast: 'Dismiss notification',
    save: 'Save',
    language: 'Language',
    languageSwitch: 'Change language',
    theme: 'Theme',
    themeSwitch: 'Change theme',
  },

  theme: {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },

  nav: {
    features: 'Features',
    proof: 'Trust',
    engineering: 'Engineering',
    signIn: 'Sign in',
    getStarted: 'Try live demo',
    dashboard: 'Dashboard',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },

  guest: {
    name: 'Guest',
    createAccount: 'Create an account',
    saveWork: 'Save my work',
    sessionNote: 'Guest data stays available in this browser for up to 30 days. Create an account to access it from another device.',
  },

  hero: {
    badge: 'Interactive demo — sample data included',
    title: 'Track the work. Keep the evidence.',
    subtitle: 'Tasks, a one-click timer, weekly reports and clean CSV exports for people who bill their own time.',
    getStarted: 'Try the live demo',
    watchDemo: 'Take the 60-second tour',
    watchDemoAria: 'Watch the demo',
    trust: ['No sign-up or card', 'Private guest workspace for 30 days', 'Keep the data by creating an account'],
    screenshotAlt:
      'The Focus10 dashboard: a running timer, daily and weekly totals, the task list and the weekly chart',
    screenshotNote:
      'Real product screens with sample workspace data. Click for the guided tour.',
    previews: {
      dashboard: { label: 'Dashboard', alt: 'Focus10 dashboard with tasks and weekly totals' },
      timer: { label: 'Running timer', alt: 'Focus10 timer running against a client task' },
      reports: { label: 'Weekly report', alt: 'Focus10 weekly chart and project breakdown' },
    },
  },

  features: {
    eyebrow: 'Features',
    title: 'A short path from task to report',
    subtitle: 'Four working parts. No feature theatre.',
    items: [
      {
        title: 'One-click timer',
        description: 'Start time from a task. A second timer automatically stops the first.',
      },
      {
        title: 'Tasks and projects',
        description: 'Organize work, filter the list and edit without leaving the dashboard.',
      },
      {
        title: 'Reports and CSV',
        description: 'See the weekly split, then export 7 days, 30 days or all history.',
      },
      {
        title: 'A realistic daily plan',
        description: 'Give it today’s available minutes; it prioritizes work without overfilling the day.',
      },
    ],
  },

  proof: {
    eyebrow: 'Under the hood',
    title: 'Specifics you can verify',
    subtitle: 'How accounts are protected, what the tests exercise, and what leaves the product when you export.',
    security: {
      title: 'Authentication and recovery',
      items: [
        'Passwords use scrypt with a random salt and timing-safe verification.',
        'A random server-side session token lives in a secure, httpOnly, SameSite=Lax cookie and expires after 30 days.',
        'Recovery links expire in one hour, work once, reveal no account existence, and revoke every active session after reset.',
      ],
    },
    tests: {
      title: 'Test strategy, not a vanity count',
      intro: 'The suite checks behavior at the boundary where failures matter:',
      layers: [
        { title: 'Logic', body: 'Planner rules, dates, localization and CSV escaping.' },
        { title: 'API + Postgres', body: 'Auth, isolation, races, timers and reports against real Postgres.' },
        { title: 'Browser journeys', body: 'Guest demo, sign-up, timer, manual time, settings and legal pages.' },
      ],
    },
    csv: {
      title: 'The export is inspectable',
      body: 'RFC 4180, UTF-8 with BOM, localized headers and safe quoting for commas and quotes.',
      download: 'Sample CSV',
      sample: 'Date,Start,End,Project,Task,Hours\n2026-09-21,09:00,10:25,Client website,Homepage design,1.42\n2026-09-22,14:00,15:30,"Internal, operations","Document the ""handoff"" flow",1.50',
    },
    engineering: {
      eyebrow: 'Hardest engineering problem',
      title: 'Making “one running timer” true under concurrency',
      body: 'Two tabs can start different tasks at the same instant. The start operation uses a Postgres advisory transaction lock per user, stops the old entry, inserts the new one, and keeps a partial unique index as the final invariant. The last request wins without double-counted time or retry storms.',
      link: 'Inspect the implementation',
    },
  },

  about: {
    eyebrow: 'About us',
    title: 'Who built this, and why',
    lead:
      'Focus10 is not the work of a big team. It is a personal project, written so that anyone who tracks their own hours gets the simplest possible tool: tasks, a timer, a weekly report.',
    body:
      'That is why you will not find invented client logos or a "12,000+ users" number here. Every claim on this page can be checked, and anything that has not been built yet is openly marked as planned.',
    repoCta: 'Read the code on GitHub',
    repoNote: 'Open source · every API route is covered by an automated test',
    points: [
      {
        title: 'No overpromising',
        body: 'Nothing unbuilt is dressed up as finished. Planned work is labelled as such, and the screenshot is a real one from the app.',
      },
      {
        title: 'Your data stays yours',
        body: 'Export your tracked time as CSV whenever you want, or delete your account together with everything in it.',
      },
      {
        title: 'Built in the open',
        body: 'The whole codebase is on GitHub, so you can check for yourself what it actually does.',
      },
    ],
  },

  useCases: {
    eyebrow: 'Who it is for',
    title: 'For people who track their own hours',
    subtitle:
      'Focus10 is a new product, so instead of customer quotes you get an honest description of when it actually helps.',
    problemLabel: 'Problem. ',
    solutionLabel: 'Solution. ',
    items: [
      {
        audience: 'Freelance designer',
        problem: 'Answering “why did that take so long?” is hard.',
        solution:
          'Every task is tracked separately. At the end of the month you export the CSV and send the whole breakdown as one file.',
      },
      {
        audience: 'Solo developer',
        problem:
          'Three projects are running at once and it is unclear which one is eating the hours.',
        solution:
          'Attach tasks to projects, then read straight off the weekly report how many hours went where.',
      },
      {
        audience: 'Small studio',
        problem: 'Time tracking lives in everyone’s notebook and adding it up is work.',
        solution:
          'Everyone tracks from their own account and the data sits on the server. Export is available at any time.',
      },
    ],
  },

  cta: {
    title: 'Try it before you trust it',
    subtitle: 'Open a sample workspace now. Sign up only if you want to keep it.',
    button: 'Open the live demo',
  },

  footer: {
    tagline: 'A task and timer tool for freelancers who track their own hours.',
    pageHeading: 'On this page',
    stackHeading: 'Built with',
    plannedHeading: 'Planned',
    openApp: 'Open the app',
    signIn: 'Sign in',
    stack: [
      'React 19 + Vite + Tailwind CSS',
      'Express 5 + Postgres (node-postgres)',
      'Logic, API, database and browser tests',
    ],
    plannedNote: 'Not built yet — nothing here is clickable.',
    planned: ['PDF reports', 'Invoicing', 'Team mode', 'Calendar sync'],
    disclaimer: 'A small, independently built product with transparent data controls.',
  },

  legal: {
    eyebrow: 'Legal',
    effective: 'Effective and last updated September 26, 2026',
    contactTitle: 'Operator and contact',
    contactBody: 'Focus10 is an independently operated, open-source service maintained through the linked repository. Use a public issue for general questions; use a private security advisory for account, privacy, or vulnerability details. Never post personal data in a public issue.',
    generalContact: 'General questions',
    privateContact: 'Private report',
    privacy: {
      title: 'Privacy Policy',
      intro: 'Focus10 collects only the information needed to run the task and time-tracking service. This policy explains what is stored and what choices you have.',
      sections: [
        {
          title: 'Information we store',
          items: [
            'Account information: your name, email address, password hash, verification status, and session records.',
            'Workspace information: projects, tasks, plans, time entries, and the settings you choose.',
            'Basic operational logs used to diagnose errors, secure the service, and prevent abuse.',
          ],
        },
        {
          title: 'Purpose and legal basis',
          body: 'Account and workspace data is processed to provide the service you request. Security and operational data is processed to prevent abuse and keep the service reliable. Messages are sent to verify an address or fulfill a recovery request. Where consent or another basis is required by applicable law, that basis will be requested. Focus10 does not sell personal data or use it for targeted advertising.',
        },
        {
          title: 'Cookies and local storage',
          body: 'A secure httpOnly cookie keeps you signed in. Language and theme choices are stored in your browser. These are functional controls, not advertising trackers.',
        },
        {
          title: 'Service providers',
          body: 'Hosting, Postgres database, and transactional-email providers process data only as needed to operate Focus10. They may process information in another country and are selected subject to contractual and legal safeguards available for the deployment.',
        },
        {
          title: 'Retention and your choices',
          body: 'Guest workspaces and sessions expire after 30 days. Registered data remains until you delete the account or the service must remove it. Account deletion removes the account and its projects, tasks, plans, sessions, tokens, and time entries. Short-lived logs and backups may remain temporarily where technically necessary.',
        },
        {
          title: 'Access, correction, export, and deletion',
          body: 'You can review and correct workspace data in the product, export completed time entries as CSV, and delete the account in Settings. Depending on applicable law, you may also ask for access, correction, restriction, objection, portability, or deletion through the private contact above. You may complain to your local data-protection authority.',
        },
        {
          title: 'Security and children',
          body: 'Focus10 uses access controls, hashed passwords, revocable sessions, rate limits, and transport security, but no online service can guarantee absolute security. The service is not directed to children under 16 and should not be used by anyone who cannot legally consent to this processing.',
        },
        {
          title: 'Questions and changes',
          body: 'Use the private contact above for requests containing personal information. Material policy changes will be shown here with a new effective date; continued use after the effective date means the revised policy applies.',
        },
      ],
    },
    terms: {
      title: 'Terms of Service',
      intro: 'These terms govern your use of Focus10. By creating an account or using the service, you agree to them.',
      sections: [
        {
          title: 'The service',
          body: 'Focus10 provides task management, time tracking, planning, reports, and data export. It is currently free, with no billing system. Features, limits, or availability may change; material changes will be described before they take effect where practical.',
        },
        {
          title: 'Eligibility',
          body: 'You must be at least 16 and legally able to accept these terms. If you use Focus10 for an organization, you confirm that you have authority to bind it.',
        },
        {
          title: 'Your account',
          items: [
            'Provide accurate account information and keep your password secure.',
            'You are responsible for activity performed through your account.',
            'Do not use the service to break the law, harm others, probe security, or disrupt availability.',
          ],
        },
        {
          title: 'Your data',
          body: 'You retain ownership of what you enter and grant Focus10 a limited permission to host, process, and display it only to operate and secure the service. You are responsible for having the right to upload that information. You can export time records or delete the account from Settings.',
        },
        {
          title: 'Software and feedback',
          body: 'The Focus10 name, interface, and service remain the operator’s property, subject to any open-source license covering published code. If you provide feedback, Focus10 may use it without payment or obligation to implement it.',
        },
        {
          title: 'Availability and warranties',
          body: 'Focus10 is an early product provided on an “as is” and “as available” basis. We work to keep it reliable but cannot promise uninterrupted operation or that every result will fit every business, tax, payroll, or legal purpose.',
        },
        {
          title: 'Liability',
          body: 'To the extent permitted by law, Focus10 is not liable for indirect losses, lost profits, or lost data arising from use of the service. Keep exports or other backups when records are business-critical.',
        },
        {
          title: 'Termination and changes',
          body: 'You may stop using Focus10 and delete your account at any time. Access may be restricted for abuse or security risks. Material term changes will be published here with an updated effective date.',
        },
        {
          title: 'Disputes and general terms',
          body: 'Applicable law and any mandatory consumer protections govern these terms. Before filing a claim, please use the contact above and allow a reasonable opportunity to resolve it. If one provision is unenforceable, the remaining provisions continue. These terms and the Privacy Policy are the entire agreement for the service.',
        },
      ],
    },
  },

  auth: {
    signupTitle: 'Create an account',
    signinTitle: 'Sign in',
    signupSubtitle: 'Free to sign up, no card required.',
    signinSubtitle: 'Enter your email and password.',
    name: 'Full name',
    namePlaceholder: 'Alex Doe',
    email: 'Email',
    emailPlaceholder: 'you@company.com',
    password: 'Password',
    passwordPlaceholder: 'At least 8 characters',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    submitting: 'Checking…',
    signupSubmit: 'Sign up',
    signinSubmit: 'Sign in',
    haveAccount: 'Already have an account?',
    noAccount: 'No account yet?',
    switchToSignin: 'Sign in',
    switchToSignup: 'Sign up',
    forgotLink: 'Forgot it?',
    recoverAction: 'Send me a password reset link',
    signinAction: 'Sign in with this email instead',
    forgotTitle: 'Forgot your password?',
    forgotSubtitle: 'Enter your email and we will send you a reset link.',
    forgotSubmit: 'Send the link',
    forgotSentTitle: 'Check your inbox',
    forgotSentBody:
      'If that email has an account, a reset link is on its way. The link is valid for 1 hour.',
    backToSignin: 'Back to sign in',
    errors: {
      name: 'Enter your name (at least 2 characters).',
      email: 'Enter a valid email.',
      password: 'Password must be at least 8 characters.',
    },
  },

  reset: {
    title: 'New password',
    body: 'Pick a new password — at least 8 characters.',
    submit: 'Save the password',
    noToken: 'The link is incomplete. Open the full link from the email.',
    done: 'Password changed. Sign in with the new one.',
    newLink: 'Send me a new link',
  },

  verify: {
    working: 'Confirming…',
    doneTitle: 'Email confirmed',
    doneBody:
      'Thank you. If you ever forget your password, you can now get the account back through this address.',
    failedTitle: 'That link does not work',
    failedBody: 'It has expired or has already been used.',
    banner:
      '{{email}} is not confirmed yet. Confirm it so you can recover the account if you forget your password.',
    resend: 'Send the link again',
    resent: 'Confirmation link sent.',
  },

  waking: {
    title: 'Waking the server up…',
    body:
      'On the free hosting plan the server goes to sleep when nobody is using it. The first load can take up to a minute — everything after that is fast.',
  },

  demo: {
    label: 'Focus10 demo',
    eyebrow: 'Demo',
    title: 'How Focus10 works',
    imageAlt: 'The Focus10 dashboard',
    imageNote:
      'Above is a real screenshot of the app, with data from a sample account.',
    stepAria: 'Step {{index}}: {{title}}',
    replay: 'Replay',
    pause: 'Pause',
    play: 'Play',
    cta: 'Get Started',
    steps: [
      {
        title: 'Start the timer with one click',
        body: 'Hit the ▶ button next to a task and time starts recording against it.',
      },
      {
        title: 'Organise your tasks',
        body: 'Attach them to a project and filter by status or project. Finishing a task stops its timer.',
      },
      {
        title: 'See your week',
        body: 'One glance at the chart tells you which project your time went to.',
      },
      {
        title: 'Export the report as CSV',
        body: 'Take 7 days, 30 days or your whole history as a single file and send it to a client.',
      },
    ],
  },

  errorBoundary: {
    title: 'Something went wrong',
    body: 'An unexpected error occurred. Try reloading the page — your data is safe on the server, nothing is lost.',
    reload: 'Reload the page',
    logged: 'The app threw an error:',
  },

  notFound: {
    title: 'This page does not exist',
    body: 'The link may be outdated, or the address may have a typo.',
    home: 'Back to home',
  },

  dashboard: {
    timerRunning: 'Timer running',
    stop: 'Stop',
    timerIdle: 'The timer is stopped. Hit the ▶ button next to a task.',
    today: 'Today',
    thisWeek: 'This week',
    openTasks: 'Open tasks',
    tasks: 'Tasks',
    newTask: 'New task',
    newTaskPlaceholder: 'New task…',
    project: 'Project',
    noProject: 'No project',
    add: 'Add',
    statusFilter: 'Filter by status',
    projectFilter: 'Filter by project',
    allProjects: 'All projects',
    taskCount: '{{count}} tasks',
    emptyAll: 'No tasks yet. Add one above.',
    emptyFiltered: 'No tasks match this filter.',
    byProject: 'By project',
    noTimeThisWeek: 'No time tracked this week yet.',
    accountSettings: 'Account settings',
    filters: {
      open: 'Open',
      done: 'Done',
      all: 'All',
    },
  },

  timeEntries: {
    title: 'Time entries',
    body: 'Forgot the timer? Add the time manually, or correct a recent entry.',
    task: 'Task for the time entry',
    startedAt: 'Start date and time',
    minutes: 'Minutes',
    add: 'Add time',
    empty: 'No completed time entries yet.',
    edit: 'Edit time entry',
    delete: 'Delete time entry',
    confirmDelete: 'Confirm deleting time entry',
    confirm: 'Delete',
  },

  insights: {
    title: 'What your data says',
    sample: 'Last {{days}} days · {{sessions}} sessions',
    notReady:
      'Not enough tracked time to say anything honest yet. Track about {{sessions}} more sessions and the patterns show up here.',
    stripAlt: 'Tracked time by hour of the day.',
    items: {
      peakWindow:
        'Your deepest stretch is {{from}}–{{to}} — {{share}}% of everything you track happens there.',
      trend: {
        up: 'This week is {{percent}}% up on last week: {{current}} against {{previous}}.',
        down: 'This week is {{percent}}% down on last week: {{current}} against {{previous}}.',
      },
      streak: '{{days}} days in a row with time on the clock.',
      bestWeekday: '{{weekday}} is your strongest day — {{duration}} on average.',
      sessionLength:
        'A typical session runs {{median}}; the longest one was {{longest}}.',
      fragmentation:
        '{{percent}}% of your sessions end inside 10 minutes ({{sessions}} of them) — that is switching, not focus.',
      topProject: '{{project}} took {{share}}% of this week.',
    },
  },

  plan: {
    title: 'Today’s plan',
    replan: 'Plan again',
    checkIn: {
      title: 'How much time do you have today?',
      morning: 'Good morning.',
      afternoon: 'The day is already moving.',
      evening: 'A late start is still a start.',
      body:
        'Answer with what is actually left of your day. The plan is built from that, and everything it does not fit moves to the days ahead — you are not meant to do a week in one evening.',
      customLabel: 'or',
      customUnit: 'hours',
      submit: 'Plan my day',
    },
    presets: {
      full: 'Free all day',
      half: 'Half a day',
      short: 'A couple of hours',
      tiny: 'Not my day',
    },
    progress: '{{done}} done of {{planned}}',
    capacityNote: 'You said you have {{capacity}} today.',
    spare: '{{spare}} of it is still free.',
    allDone: 'Today’s plan is done. Anything past this is a bonus, not a debt.',
    emptyItems:
      'Nothing to plan: no open task has time left on it. Add one below and it will be waiting here tomorrow morning.',
    itemProgress: '{{done}} so far',
    itemDone: 'Finished',
    reasons: {
      overdue: 'Overdue',
      dueToday: 'Due today',
    },
    due: {
      today: 'Today',
      overdue: 'Overdue',
    },
    dueChoices: {
      none: 'No deadline',
      today: 'By today',
      tomorrow: 'By tomorrow',
      week: 'This week',
      month: 'This month',
    },
    priority: {
      1: 'Must do',
      2: 'Should do',
      3: 'Nice to do',
    },
    fields: {
      estimate: 'How long it takes',
      noEstimate: 'No estimate',
      priority: 'Priority',
      due: 'Deadline',
    },
    outlook: {
      week: {
        ok: 'Next {{days}} days: {{needed}} left across {{tasks}} things — about {{perDay}} a day.',
        tight:
          'Next {{days}} days: {{needed}} left — about {{perDay}} a day. It fits, but there is no slack in it.',
        over: 'Next {{days}} days: {{needed}} left — that is {{perDay}} a day. Move a deadline or drop something now, while it is still your choice.',
      },
      month: {
        ok: 'Next {{days}} days: {{needed}} in total — about {{perDay}} a day.',
        tight: 'Next {{days}} days: {{needed}} in total — about {{perDay}} a day.',
        over: 'Next {{days}} days: {{needed}} in total — {{perDay}} a day. That is more than a month holds.',
      },
    },
    backlog: {
      title: 'Not today ({{count}})',
      riskySummary: '{{count}} of them will not fit in the days that are left.',
      left: '{{duration}} left · {{days}} d',
    },
  },

  task: {
    editAria: 'Edit task name',
    editTitle: 'Click to edit',
    saveEdit: 'Save',
    markUndone: 'Mark as not done',
    markDone: 'Mark as done',
    stopTimer: 'Stop the timer',
    startTimer: 'Start the timer',
    delete: 'Delete task',
  },

  projects: {
    title: 'Projects',
    newPlaceholder: 'New project…',
    newAria: 'New project name',
    add: 'Add project',
    empty: 'No projects yet.',
    openCount: '{{count}} open',
    deleteAria: 'Delete the “{{name}}” project',
    note: 'Deleting a project keeps its tasks — they move to “No project”.',
  },

  userMenu: {
    settings: 'Settings',
    logout: 'Sign out',
  },

  settings: {
    title: 'Settings',
    account: 'Account',
    name: 'Full name',
    email: 'Email',
    exportTitle: 'Download your data',
    exportBody:
      'Take your tracked time as CSV — Excel and Google Sheets both open it.',
    rangeWeek: 'Last 7 days',
    rangeMonth: 'Last 30 days',
    rangeAll: 'All time',
    languageTitle: 'Language',
    languageBody:
      'The language you pick is stored in this browser and is used for server messages too.',
    themeTitle: 'Theme',
    themeBody:
      'On “System” the app follows your device setting. Your choice is stored in this browser.',
    passwordTitle: 'Change password',
    passwordBody: 'Changing it signs you out of every other device.',
    currentPassword: 'Current password',
    newPassword: 'New password',
    passwordTooShort: 'Password must be at least 8 characters.',
    changePassword: 'Change',
    passwordChanged: 'Password changed. You have been signed out of other devices.',
    dangerTitle: 'Delete account',
    dangerBody:
      'Every project, task and time entry is deleted for good. This cannot be undone — export your data as CSV first.',
    confirmPassword: 'Enter your password to confirm',
    deleteForever: 'Delete for good',
  },

  format: {
    // Күн атауын Intl осы жермен алады
    locale: 'en-GB',
    seconds: '{{value}}s',
    minutes: '{{value}}m',
    hoursMinutes: '{{hours}}h {{minutes}}m',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekdaysLong: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
  },

  // Shown only when the server sends no message of its own — usually a
  // hosting-level error. Say what happened and what to do about it.
  api: {
    failed: 'The request did not go through (error {{status}}). Reload the page and try again.',
    offline: 'You appear to be offline. Check your connection and try again.',
    unreachable:
      'Could not reach the server. Check your connection, or try again in a minute.',
    timeout:
      'The server did not respond in time. On free hosting it may have gone to sleep — wait about 30 seconds and try again.',
    waking:
      'The server is unavailable right now (it may be restarting). Try again in half a minute.',
    serverError:
      'Something broke on the server (error {{status}}). This is not your fault — try again shortly.',
    notFound: 'That address was not found. Try reloading the page.',
    tooMany: 'Too many attempts. Try again in {{seconds}} seconds.',
  },
}
