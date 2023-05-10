import axios from 'axios';
import * as vscode from 'vscode';

type Book = {
  title: string;
  authorName: string;
  urlLibrivox: string;
};

function formatBookTitle(book: Book) {
  const title = book.title;
  const authorName = book.authorName;
  return `${title} - ${authorName}`;
}

interface MediaQuickPickItem extends vscode.QuickPickItem {
  data?: {
    sourceType: string;
    url: string;
  };
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("a4m.playAudio", () => {
    const column = {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: true,
    };

    const options = { enableScripts: true };

    const LIBRIVOX_API_ENDPOINT = 'https://librivox.org/api/feed/audiobooks';
    const author = 'Jane Austen';
    const apiUrl = `${LIBRIVOX_API_ENDPOINT}?format=json&fields=title,author_name,url_librivox&extended=1&author=${author}&limit=10&offset=0`;

    axios.get(apiUrl)
      .then((response) => {
        const books = response.data.books;

        const mediaItems: MediaQuickPickItem[] = books.map((book: Book) => {
          return {
            label: formatBookTitle(book),
            alwaysShow: true,
            data: {
              sourceType: 'librivox',
              url: book.urlLibrivox,
            },
          };
        });

        vscode.window
          .showQuickPick(mediaItems, {
            placeHolder: "Choose your Audiobook",
          })
          .then((selection) => {
            if (!selection) {
              return;
            }
            if (selection.data && selection.data.sourceType === 'librivox') {
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
                        <source src="${selection.data.url}">
                      </audio>
                    </div>
                  </body>
                </html>
              `;
            }
          });
      });
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
