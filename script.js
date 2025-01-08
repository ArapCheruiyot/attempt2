<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Drive File Sync</title>
  <script src="https://apis.google.com/js/api.js"></script>
</head>
<body>
  <h1>Google Drive File Sync</h1>
  <button id="authorize-btn">Authorize Download Files</button>
  <button id="download-btn" disabled>Download Files</button>
  <p id="status">Status: Not authorized</p>

  <script>
    // Your Google API credentials
    const CLIENT_ID = "116032101343-4k05qrav25818n9r3p9vj8f793lagu0h.apps.googleusercontent.com";
    const API_KEY = "AIzaSyBBUeRHNLVDoybAPDDIUyRugFjBoR_4iIo";  // Correct API key
    const SCOPES = "https://www.googleapis.com/auth/drive.readonly";
    const FOLDER_ID = "1rSxY5C7YCGFS1mpwlAckQQuBTAn8OQH-";  // Your folder ID

    // Attach event listeners
    document.getElementById("authorize-btn").addEventListener("click", handleAuthClick);
    document.getElementById("download-btn").addEventListener("click", listAndDownloadFiles);

    function updateStatus(message) {
      document.getElementById("status").textContent = `Status: ${message}`;
    }

    // Handle the authentication click
    function handleAuthClick() {
      gapi.auth2.getAuthInstance().signIn()
        .then(() => {
          document.getElementById("download-btn").disabled = false;
          updateStatus("Authorization successful! Ready to download files.");
        })
        .catch(error => updateStatus(`Authorization error: ${error.error}`));
    }

    // List files in Google Drive folder
    function listAndDownloadFiles() {
      gapi.client.drive.files.list({
        q: `'${FOLDER_ID}' in parents`,
        fields: "files(id, name)"
      }).then(response => {
        const files = response.result.files;
        if (files && files.length > 0) {
          updateStatus(`Found ${files.length} file(s). Starting download...`);
          files.forEach(file => downloadFile(file));
        } else {
          updateStatus("No files found in the specified folder.");
        }
      }).catch(error => updateStatus(`Error listing files: ${error.message}`));
    }

    // Download a file from Google Drive
    function downloadFile(file) {
      const fileId = file.id;
      const fileName = file.name;

      gapi.client.drive.files.get({
        fileId: fileId,
        alt: "media"
      }).then(response => {
        const blob = new Blob([response.body], { type: response.headers['Content-Type'] });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        updateStatus(`File downloaded: ${fileName}`);
      }).catch(error => updateStatus(`Error downloading file '${fileName}': ${error.message}`));
    }

    // Initialize the Google API client
    function initClient() {
      gapi.load("client:auth2", () => {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES
        }).then(() => {
          updateStatus("Client initialized. Ready to authenticate.");
        }).catch(error => updateStatus(`Error initializing client: ${error.message}`));
      });
    }

    // Initialize the API client
    initClient();
  </script>
</body>
</html>
