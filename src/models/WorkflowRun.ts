export interface WorkflowRun {
  action?: 'requested' | 'completed';
  organization: Organization;
  repository: WorkflowRunRepository;
  sender: Sender;
  workflow: Workflow;
  workflow_run: WorkflowRunClass;
}

export interface Organization {
  avatar_url: string;
  description: string;
  events_url: string;
  hooks_url: string;
  id: number;
  issues_url: string;
  login: string;
  members_url: string;
  node_id: string;
  public_members_url: string;
  repos_url: string;
  url: string;
}

export interface WorkflowRunRepository {
  archive_url: string;
  archived: boolean;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  clone_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  created_at: string;
  default_branch: string;
  deployments_url: string;
  description: null;
  disabled: boolean;
  downloads_url: string;
  events_url: string;
  fork: boolean;
  forks: number;
  forks_count: number;
  forks_url: string;
  full_name: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  has_downloads: boolean;
  has_issues: boolean;
  has_pages: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  homepage: null;
  hooks_url: string;
  html_url: string;
  id: number;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  language: null;
  languages_url: string;
  license: null;
  merges_url: string;
  milestones_url: string;
  mirror_url: null;
  name: string;
  node_id: string;
  notifications_url: string;
  open_issues: number;
  open_issues_count: number;
  owner: Sender;
  private: boolean;
  pulls_url: string;
  pushed_at: string;
  releases_url: string;
  size: number;
  ssh_url: string;
  stargazers_count: number;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  svn_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;
  updated_at: string;
  url: string;
  watchers: number;
  watchers_count: number;
}

export interface Sender {
  avatar_url: string;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string;
  html_url: string;
  id: number;
  login: string;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
}

export interface Workflow {
  badge_url: string;
  created_at: string;
  html_url: string;
  id: number;
  name: string;
  node_id: string;
  path: string;
  state: string;
  updated_at: string;
  url: string;
}

export interface WorkflowRunClass {
  artifacts_url: string;
  cancel_url: string;
  check_suite_id: number;
  check_suite_node_id: string;
  check_suite_url: string;
  conclusion: null;
  created_at: string;
  event: string;
  head_branch: string;
  head_commit: HeadCommit;
  head_repository: HeadRepositoryClass;
  head_sha: string;
  html_url: string;
  id: number;
  jobs_url: string;
  logs_url: string;
  name: string;
  node_id: string;
  previous_attempt_url: null;
  pull_requests: any[];
  repository: HeadRepositoryClass;
  rerun_url: string;
  run_attempt: number;
  run_number: number;
  run_started_at: string;
  status: string;
  updated_at: string;
  url: string;
  workflow_id: number;
  workflow_url: string;
}

export interface HeadCommit {
  author: Author;
  committer: Author;
  id: string;
  message: string;
  timestamp: string;
  tree_id: string;
}

export interface Author {
  email: string;
  name: string;
}

export interface HeadRepositoryClass {
  archive_url: string;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  deployments_url: string;
  description: null;
  downloads_url: string;
  events_url: string;
  fork: boolean;
  forks_url: string;
  full_name: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  hooks_url: string;
  html_url: string;
  id: number;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  languages_url: string;
  merges_url: string;
  milestones_url: string;
  name: string;
  node_id: string;
  notifications_url: string;
  owner: Sender;
  private: boolean;
  pulls_url: string;
  releases_url: string;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;
  url: string;
}
