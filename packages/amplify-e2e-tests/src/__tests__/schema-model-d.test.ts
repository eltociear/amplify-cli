/* eslint-disable spellcheck/spell-checker */
/* eslint-disable import/no-extraneous-dependencies */

import {
  initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir,
} from '@aws-amplify/amplify-e2e-core';
import { testSchema } from '../schema-api-directives';

describe('api directives @model d', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await createNewProjectDir('model');
    await initJSProjectWithProfile(projectDir, {});
  });

  afterEach(async () => {
    await deleteProject(projectDir);
    deleteProjectDir(projectDir);
  });

  it('model usage4', async () => {
    const testresult = await testSchema(projectDir, 'model', 'usage4');
    expect(testresult).toBeTruthy();
  });
});
