/* eslint-disable spellcheck/spell-checker */
import {
  FeatureFlags, pathManager, stateManager,
} from 'amplify-cli-core';
import { printer } from 'amplify-prompts';

// This is copy-pasta from the category api until they can expose the method to plugins

/**
 * Shorthand for Feature flag retrieval.
 */
const useExperimentalPipelinedTransformerFF = (): boolean => FeatureFlags.getBoolean('graphQLTransformer.useExperimentalPipelinedTransformer');
const transformerVersionFF = (): number => FeatureFlags.getNumber('graphQLTransformer.transformerVersion');

/**
 * Inspect feature flags for the project and determine if this particular project should be using graphql v2 or v1.
 * Coerces feature flags into a sane state if they are out of, and throws error on invalid configuration.
 */
export const getTransformerVersion = async (): Promise<number> => {
  if (useExperimentalPipelinedTransformerFF() === false) {
    return 1;
  }

  if (isLegacyFeatureFlagConfiguration()) {
    await migrateToTransformerVersionFeatureFlag();
  }

  const transformerVersion = transformerVersionFF();
  if (transformerVersion !== 1 && transformerVersion !== 2) {
    throw new Error(`Invalid value specified for transformerVersion: '${transformerVersion}'`);
  }

  return transformerVersion;
};

/**
 * Return whether or not the project is configured with legacy pipelined transformer feature flags, and may need to be updated.
 */
const isLegacyFeatureFlagConfiguration = (): boolean => useExperimentalPipelinedTransformerFF() && transformerVersionFF() === 1;

/**
 * Update project feature flags and alert the user if they have a deprecated set of feature flags.
 */
const migrateToTransformerVersionFeatureFlag = async (): Promise<void> => {
  const projectPath = pathManager.findProjectRoot() ?? process.cwd();

  const config = stateManager.getCLIJSON(projectPath, undefined, {
    throwIfNotExist: false,
    preserveComments: true,
  });

  // eslint-disable-next-line spellcheck/spell-checker
  config.features.graphqltransformer.transformerversion = 2;
  stateManager.setCLIJSON(projectPath, config);
  await FeatureFlags.reloadValues();
  // eslint-disable-next-line spellcheck/spell-checker
  printer.warn(
    `\nThe project is configured with 'transformerVersion': ${transformerVersionFF()}, but 'useExperimentalPipelinedTransformer': ${useExperimentalPipelinedTransformerFF()}. Setting the 'transformerVersion': ${
      config.features.graphqltransformer.transformerversion
    }. 'useExperimentalPipelinedTransformer' is deprecated.`,
  );
};
