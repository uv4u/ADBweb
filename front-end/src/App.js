import React, { useState, useEffect } from 'react';
import axios from 'axios';


const App = () => {
  const [apkPath, setApkPath] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.get('http://localhost:3001/install-apk', {
        params: { apkPath: apkPath },
      });
      alert(response.data)
      // alert(`Installed APK: ${response.data} on device: ${response.data}`);

      // Clear the input field after successful installation
      setApkPath('');

      // Update the device ID after successful installation
      setDeviceId(response.data.deviceId);

    } catch (error) {
      if (error.response) {
        console.error('Error:', error.response.status, error.response.statusText);
        if (error.response.data && error.response.data.error) {
          alert(`Error occurred while installing APK: ${error.response.data.error}`);
        } else {
          alert(`Error occurred while installing APK: ${error.response.status} ${error.response.statusText}`);
        }
      } else if (error.request) {
        console.error('Error:', 'No response received from the server.');
        alert('Error occurred while installing APK: No response received from the server.');
      } else {
        console.error('Error:', error.message);
        alert(`Error occurred while installing APK: ${error.message}`);
      }
    
      setApkPath('');
    }
  };

  const handleFetchLogs = async () => {
    setLoading(true);
    try {
        const response = await axios.get('http://localhost:3001/device-logs');
        console.log(response);
        // setLogs(response.data.logs);
        setError('');
    } catch (error) {
      setLogs(error.response.data.logs);
        // setLogs(error.response.data.logs);
        setError('Error fetching logs');
    }
    setLoading(false);
};

  const handleStopLogcat = async () => {
    try {
      const response = await axios.get('http://localhost:3001/stop-logcat');
      console.log('Logcat stopped successfully');
      alert('Logcat stopped successfully');
    } catch (error) {
      console.error('Error stopping logcat:', error);
      alert('Error stopping logcat');
    } 
  };

  // Fetch device ID when component mounts
  useEffect(() => {
    const fetchDeviceID = async () => {
      try {
        const response = await axios.get('http://localhost:3001/device-id')
              .then(response => {
                if (response.data && response.data.deviceID) {
                  setDeviceId(response.data.deviceID);
                  alert(`Device : ${response.data.deviceID} connected`)
                }
            })
            .catch(err => {
                // Handle errors
                console.error(err);
            });
       
      } catch (error) {
        console.error("Error: ", error);
      }
    };
  
    fetchDeviceID();
  }, []);


  return (
    <div class="container">
      <span>  </span>
  <div class="jumbotron">
    <form onSubmit={handleSubmit}>
      <div class="row mb-3">
        <label for="deviceId" class="form-label">Device ID:</label>
        <div class="col-sm-10">
          {deviceId ? (
            <input
              type="text"
              class="form-control"
              id="deviceId"
              value={deviceId}
              readonly
            />
          ) : (
            <span>No device connected</span>
          )}
        </div>
      </div>
      <div class="mb-3">
        <label for="apkPath" class="form-label">APK Path:</label>
        <input
          type="text"
          class="form-control"
          id="apkPath"
          value={apkPath}
          onChange={(e) => setApkPath(e.target.value)}
        />
      </div>
      <button class="btn btn-primary" type="submit">Install APK</button>
    </form>
    <div class="mb-3">
      <label for="logTextArea" class="form-label">Logs:</label>
      <textarea class="form-control" 
      id="logTextArea" 
      rows="10" 
      value={logs.join('\n')}
      readOnly
      ></textarea>
    </div>
      <button class="btn btn-primary" onClick={handleFetchLogs}>Fetch Logs</button>
      <button className="btn btn-danger ms-2" onClick={handleStopLogcat}>Stop Logcat</button>
  </div>
</div>


  );
};

export default App;