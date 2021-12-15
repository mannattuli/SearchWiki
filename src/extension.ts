import * as vscode from "vscode";
import fetch from "node-fetch";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.searchwiki",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("editor does not exist");
        return;
      }

      const text = editor.document.getText(editor.selection);

      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&origin=*&srlimit=25&utf8=&format=json&srsearch=${text.replace(
          " ",
          "+"
        )}`
      );
      const data = await response.json();

      const quickPick = vscode.window.createQuickPick();
      quickPick.items = data.query.search.map((x: any) => ({
        label: x.title,
        detail: `https://en.wikipedia.org/wiki/${x.title.replaceAll(" ", "_")}`,
        link: `https://en.wikipedia.org/wiki/${x.title.replaceAll(" ", "_")}`,
      }));

      quickPick.onDidChangeSelection(([item]) => {
        if (item) {
          //@ts-ignore
          vscode.env.openExternal(item.link);
          quickPick.dispose();
        }
      });
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    }
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
