import {
  $TSContext, AmplifyError, pathManager, stateManager,
} from 'amplify-cli-core';

/**
 * Mobile hub command compatibility check
 */
export const ensureMobileHubCommandCompatibility = (context: $TSContext): void => {
  context.projectHasMobileHubResources = false;

  checkIfMobileHubProject(context);

  // Only do further checks if it is mobile hub migrated project
  if (!context.projectHasMobileHubResources) {
    return;
  }

  ensureSupportedCommand(context);
};

const checkIfMobileHubProject = (context: $TSContext): void => {
  const projectPath = pathManager.findProjectRoot();

  if (!projectPath) {
    return;
  }

  const meta = stateManager.getMeta(projectPath, { throwIfNotExist: false });

  if (!meta) {
    return;
  }

  let hasMigratedResources = false;

  Object.keys(meta)
    .filter(k => k !== 'providers')
    .forEach(category => {
      Object.keys(meta[category]).forEach(resourceName => {
        const resource = meta[category][resourceName];

        // Mobile hub migrated resources has this property on the resource record set to true by migrator plugin.
        if (resource.mobileHubMigrated === true) {
          hasMigratedResources = true;
        }
      });
    });

  context.projectHasMobileHubResources = hasMigratedResources;
};

const ensureSupportedCommand = (context: $TSContext): void => {
  const { command } = context.input;

  // env commands are not supported for projects that having resources without provider assigned
  if (command === 'env') {
    throw new AmplifyError('CommandNotSupportedError', {
      message: 'multi-environment support is not available for Amplify projects with Mobile Hub migrated resources.',
      link: 'https://docs.amplify.aws/cli/project/troubleshooting/',
    });
  }
};
