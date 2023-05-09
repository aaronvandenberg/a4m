import * as vscode from 'vscode';

type AudioSource = {
  label: string;
  audios: string[];
};

const internalAudioSources: AudioSource[] = [
  {
    label: "Industrial Society And Its Future",
    audios: ["https://ia600108.us.archive.org/1/items/TheodoreJohnKaczynskiIndustrialSocietyAndItsFuture1995www.MP3Fiber.com/Theodore_John_Kaczynski_Industrial_Society_and_Its_Future_1995%5Bwww.MP3Fiber.com%5D.mp3"],
  },
  {
    label: "Calm",
    audios: ["https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"],
  },
  {
    label: "Lively",
    audios: ["https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"],
  },
];

export function activate(context: vscode.ExtensionContext) {
  const userAudioSources: AudioSource[] = vscode.workspace
    .getConfiguration()
    .get("a4m.customAudioSources") || [];

  const audioSources = internalAudioSources.concat(userAudioSources);

  let disposable = vscode.commands.registerCommand("a4m.playAudio", () => {
    const column = {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: true,
    };

    const options = { enableScripts: true };

    const mediaItems: vscode.QuickPickItem[] = audioSources.flatMap((source) => {
      return source.audios.map((audioPath) => {
        return {
          label: audioPath,
          detail: "Audio", // Set detail to "Audio" to indicate that the selected item is an audio file
          alwaysShow: true,
        };
      });
    });

    vscode.window
      .showQuickPick(mediaItems, {
        placeHolder: "Choose your Audio Book",
      })
      .then((selection) => {
        if (!selection) {
          return;
        }
        if (selection.detail === "Audio") {
          const selectedSource = audioSources.find(
            (source) => source.audios.includes(selection.label)
          );
          if (!selectedSource) {
            return;
          }
          const { audios } = selectedSource;
          const audio = audios.sort(() => Math.random() - 0.5)[0];
          const panel = vscode.window.createWebviewPanel(
            "a4m", // Identifies the type of the webview
            "Audio for the masses", // Title of the panel displayed to the user
            column, // Editor column to show the new webview panel in
            options // Webview options
          );
          panel.reveal();
          panel.webview.html = `
            <html lang="en"> 
              <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body>
                <div>
                  <audio controls>
                     <br>
                    <source src="${audio}">
                  </audio>
                </div>
              </body>
            </html>
          `;
        }
      });
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
