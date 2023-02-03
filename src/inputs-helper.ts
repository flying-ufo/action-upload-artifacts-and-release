import * as core from "@actions/core";
import { ActionInputs } from "./action-inputs";
import { Inputs, NoFileOptions } from "./constants";
import { env } from "process";

function getBooleanInput(name: string): boolean | undefined {
  const value = getStringInput(name);
  if (value === undefined) {
    return undefined;
  }
  const trueValues = ["true", "yes", "on"];
  const falseValues = ["false", "no", "off"];
  if (trueValues.indexOf(value.toLowerCase()) >= 0) {
    return true;
  } else if (falseValues.indexOf(value.toLowerCase()) >= 0) {
    return false;
  } else {
    throw Error(`Bad boolean value: ${value}`);
  }
}

function getNumberInput(name: string): number | undefined {
  const value = getStringInput(name);
  if (value === undefined) {
    return undefined;
  }
  const valueAsNumber = parseInt(value);
  if (isNaN(valueAsNumber)) {
    throw Error(`Invalid number: ${value}`);
  }
  return valueAsNumber;
}

function getStringInput(name: string): string | undefined {
  return core.getInput(name) || undefined;
}

function getRequiredStringInput(name: string): string {
  return core.getInput(name, { required: true });
}

export function getInputs(): ActionInputs {
  const ifNoFilesFound = core.getInput(Inputs.IfNoFilesFound);
  const noFileBehavior: NoFileOptions = NoFileOptions[ifNoFilesFound];

  if (!noFileBehavior) {
    throw Error(
      `Unrecognized ${Inputs.IfNoFilesFound} input: ${ifNoFilesFound}`
    );
  }

  const inputs: ActionInputs = {
    githubToken: env.GITHUB_TOKEN,
    searchPath: getRequiredStringInput(Inputs.Path),
    ifNoFilesFound: noFileBehavior,
    retentionDays: getNumberInput(Inputs.RetentionDays),
    releaseUploadUrl: getStringInput(Inputs.ReleaseUploadUrl),
    uploadReleaseFiles: getBooleanInput(Inputs.UploadReleaseFiles) ?? false,
    retryLimit: getNumberInput(Inputs.RetryLimit) ?? 3,
    retryInterval: getNumberInput(Inputs.RetryInterval) ?? 3,
  };

  if (inputs.uploadReleaseFiles) {
    if (inputs.githubToken === undefined) {
      throw Error(
        `${Inputs.UploadReleaseFiles} is true but GITHUB_TOKEN is not provided`
      );
    }
    if (inputs.releaseUploadUrl === undefined) {
      throw Error(
        `${Inputs.UploadReleaseFiles} is true but ${Inputs.ReleaseUploadUrl} is not provided`
      );
    }
    if (inputs.retryLimit < 1 || inputs.retryLimit > 10) {
      throw Error(
        `${Inputs.RetryLimit} must be between 1 and 10, but it is ${inputs.retryLimit}`
      );
    }
    if (inputs.retryInterval < 1 || inputs.retryInterval > 10) {
      throw Error(
        `${Inputs.RetryInterval} must be between 1 and 10, but it is ${inputs.retryInterval}`
      );
    }
  }

  return inputs;
}
