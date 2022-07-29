type OcotokitRepoList = {
  total_count: number;
  artifacts: {
    id: number;
    node_id: string;
    name: string;
    size_in_bytes: number;
    url: string;
    archive_download_url: string;
    expired: boolean;
    created_at: string;
    updated_at: string;
    expires_at: string;
    workflow_run: {
      id: number;
      repository_id: number;
      head_repository_id: number;
      head_branch: string;
      head_sha: string;
    };
  }[];
};

type ProjectConfig = {
  webhookSecret: string;
  repositoryName: string;
  projectName: string;
  receipt: 'nodejs' | 'react';
  env: {
    [key: string]: string;
  };
  installCommand: string;
  startScriptPath: string;
};

type Config = {
  port: number;
  downloadPath: string;
  runPath: string;
  projectsPath: string;
  githubToken: string;
};

export { OcotokitRepoList, ProjectConfig, Config };
