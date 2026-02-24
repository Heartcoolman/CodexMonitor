import { dict as settingsDict } from "./parts/settings";
import { dict as appDict } from "./parts/app";
import { dict as homeDict } from "./parts/home";
import { dict as gitDict } from "./parts/git";
import { dict as workspacesDict } from "./parts/workspaces";
import { dict as messagesDict } from "./parts/messages";
import { dict as miscDict } from "./parts/misc";

export const zhCN: Record<string, string> = {
  ...settingsDict,
  ...appDict,
  ...homeDict,
  ...gitDict,
  ...workspacesDict,
  ...messagesDict,
  ...miscDict,
};
