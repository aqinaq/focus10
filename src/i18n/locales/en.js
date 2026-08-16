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
    who: 'Who it is for',
    about: 'About us',
    signIn: 'Sign in',
    getStarted: 'Get Started',
    dashboard: 'Dashboard',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },

  hero: {
    badge: 'New: insights read out of your own weekly data',
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
      { value: 'Postgres', label: 'Your data in a real database, exportable at any time' },
      { value: '118 tests', label: 'Every API route is covered by an automated test' },
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
        title: 'A plan for the day you actually have',
        description:
          'Say how much time today is really yours — all of it, or twenty minutes — and the app picks what to work on and for how long. What does not fit moves to the coming days instead of piling onto tonight.',
      },
      {
        title: 'Insights from your own data',
        description:
          'The dashboard reads the last 28 days back to you: the three hours you actually focus best, your streak, how this week compares to the last, and how much of your work ends inside ten minutes.',
      },
      {
        title: 'You can get your account back',
        description:
          'Confirm your email once and a forgotten password is a link away. Reset links are single-use, expire in an hour and sign every other device out.',
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
      'Express 5 + Postgres (node-postgres)',
      '118 automated tests cover the API',
    ],
    plannedNote: 'Not built yet — nothing here is clickable.',
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
