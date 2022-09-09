export interface BuildConfig {
  readonly projectName: string;
  readonly pipelineAccountId: string;
  readonly pipelineRegion: string;
  readonly devAccountId: string;
  readonly devRegion: string;
  readonly testAccountId: string;
  readonly testRegion: string;
  readonly stgAccountId: string;
  readonly stgRegion: string;
  readonly prodAccountId: string;
  readonly prodRegion: string;

  readonly pipelineName: string;
  readonly repoString: string;
  readonly branch: string;
  readonly connectionArn: string;
  readonly sonarTokenPath: string;
  readonly sonarHostUrlPath: string;
  readonly snykTokenPath: string;
  readonly allowOrigins: Array<string>;
}
