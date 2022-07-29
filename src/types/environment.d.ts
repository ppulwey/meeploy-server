export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      DOWNLOAD_PATH: string;
      RUN_PATH: string;
      PROJECTS_PATH: string;
      GITHUB_TOKEN: string;
    }
  }
}
