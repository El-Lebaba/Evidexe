const version = process.versions.node;
const [major] = version.split(".").map(Number);

if (major < 20 || major >= 24) {
  console.error(
    [
      `Node ${version} n'est pas compatible avec ce projet Expo.`,
      "Utilise Node 22 LTS avant de lancer Expo:",
      "",
      "  nvm install 22",
      "  nvm use 22",
      "  npm start",
      "",
      "Expo Go peut echouer avec `Failed to download remote update` quand le serveur Metro tourne avec Node 24.",
    ].join("\n"),
  );
  process.exit(1);
}
