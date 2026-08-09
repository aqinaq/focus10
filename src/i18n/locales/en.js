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
    language: 'Language',
    languageSwitch: 'Change language',
  },

  nav: {
    features: 'Features',
    who: 'Who it is for',
    about: 'About us',
    signIn: 'Sign in',
    getStarted: 'Get Started',
    dashboard: 'Dashboard',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },

  hero: {
    badge: 'New: CSV export and per-project reporting',
    titleLead: 'Focus on what',
    titleAccent: 'matters',
    subtitle:
      'Focus10 is a task and timer tool for freelancers who track their own hours. Attach a task to a project, start the timer with one click, and export the week as CSV.',
    getStarted: 'Get Started',
    watchDemo: 'Watch Demo',
    watchDemoAria: 'Watch the demo',
    trust: ['Free to sign up', 'No card required', 'Export your data anytime'],
    screenshotAlt:
      'The Focus10 dashboard: a running timer, daily and weekly totals, the task list and the weekly chart',
    screenshotCta: 'See how it works',
    screenshotNote:
      'A real screenshot of the app. The projects and tasks in it come from a sample account.',
    facts: [
      { value: '$0', label: 'Every feature is free — there is no billing yet' },
      { value: 'CSV', label: 'Download your data whenever you want' },
      { value: 'SQLite', label: 'Your data in one file, on your own server' },
      { value: '48 tests', label: 'Every API route is covered by an automated test' },
    ],
  },

  features: {
    eyebrow: 'Features',
    title: 'Everything you need to run the work',
    subtitle:
      'Nothing extra: plan it, track the time, pull the report. Everything below works today.',
    items: [
      {
        title: 'One-click timer',
        description:
          'Hit the ▶ button next to a task and time starts recording against it. Only one timer runs at a time, so hours never double-count.',
      },
      {
        title: 'Tasks and projects',
        description:
          'Attach a task to a project and filter by status or project. Rename it without leaving the list; finishing a task stops its timer automatically.',
      },
      {
        title: 'Reports and CSV',
        description:
          'The weekly chart and the per-project split are built from real data. Export 7 days, 30 days or your whole history to CSV and send it to a client.',
      },
      {
        title: 'Your data is yours',
        description:
          'Passwords are hashed with scrypt and sessions live in an httpOnly cookie. Download your data at any time, or delete your account together with everything in it.',
      },
    ],
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
    title: 'Get your focus back, starting today',
    subtitle:
      'Free to sign up, no card required. Create an account in two minutes and start your first timer.',
    button: 'Get Started',
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
      'Express 5 + SQLite (node:sqlite)',
      '48 automated tests cover the API',
    ],
    planned: ['PDF reports', 'Invoicing', 'Team mode', 'Calendar sync'],
    disclaimer:
      'The product is still early: legal documents (Privacy, Terms) are not ready yet.',
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
    submitting: 'Checking…',
    signupSubmit: 'Sign up',
    signinSubmit: 'Sign in',
    haveAccount: 'Already have an account?',
    noAccount: 'No account yet?',
    switchToSignin: 'Sign in',
    switchToSignup: 'Sign up',
    errors: {
      name: 'Enter your name (at least 2 characters).',
      email: 'Enter a valid email.',
      password: 'Password must be at least 8 characters.',
    },
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

  task: {
    editAria: 'Edit task name',
    editTitle: 'Click to edit',
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
    seconds: '{{value}}s',
    minutes: '{{value}}m',
    hoursMinutes: '{{hours}}h {{minutes}}m',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },

  api: {
    failed: 'The request failed.',
  },
}
