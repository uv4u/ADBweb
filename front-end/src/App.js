import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const App = () => {
  const [apkPath, setApkPath] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [open, setOpen] = React.useState(false);


  const notify = (req) => toast(req);

  useEffect(() => {
    const fetchDeviceID = async () => {
      try {
        const response = await axios.get('http://localhost:3001/device-id')
              .then(response => {
                if (response.data && response.data.deviceID) {
                  setDeviceId(response.data.deviceID);
                  notify(`Device : ${response.data.deviceID} connected`);
                  // alert(`Device : ${response.data.deviceID} connected`)
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

  //INSTALL APP
  const handleSubmit = async (event) => {
    event.preventDefault();
    setOpen(true);

    try {
      // notify();
      const response = await axios.get('http://localhost:3001/install-apk', {
        params: { apkPath: apkPath },
      });
      // alert(response.data)
      notify(response.data);
      // alert(`Installed APK: ${response.data} on device: ${response.data}`);

      // Clear the input field after successful installation
      setApkPath('');

      // Update the device ID after successful installation
      // setDeviceId(response.data.deviceId);

    } catch (error) {
      if (error.response) {
        console.error('Error:', error.response.status, error.response.statusText);
        if (error.response.data && error.response.data.error) {
          // alert(`Error occurred while installing APK: ${error.response.data.error}`);
          notify(`Error occurred while installing APK: ${error.response.data.error}`);
          setDeviceId('')
        } else {
          // alert(`Error occurred while installing APK: ${error.response.status} ${error.response.statusText}`);
          notify(`Error occurred while installing APK: ${error.response.status} ${error.response.statusText}`)
        }
      } else if (error.request) {
        console.error('Error:', 'No response received from the server.');
        notify('Error occurred while installing APK: No response received from the server.');
        // alert('Error occurred while installing APK: No response received from the server.');
      } else {
        console.error('Error:', error.message);
        alert(`Error occurred while installing APK: ${error.message}`);
      }

    
      setApkPath('');
    }
    setOpen(false);
  };


  const handleFetchLogs = async () => {
    setOpen(true);
    setLoading(true);
    try {
        const response = await axios.get('http://localhost:3001/device-logs');
        console.log(response);
        // setLogs(response.data.logs);
        setError('');
        setOpen(false);
    } catch (error) {
      console.log('Here   ',error);
      if(error.message==='Network Error'){
        notify('Device Connection Failed');
      }
      else{
      if(error.response.data){
        setLogs(error.response.data.logs)
        notify('Logs taken successfully!')
      }
      // setLogs(error.response.data.logs);
      //   // setLogs(error.response.data.logs);
      //   setError('Error fetching logs');
    }
  }
  setOpen(false);
  setLoading(false);
  };

  function eraseText() {
    document.getElementById("logTextArea").value = "";
}



const writeToFile = async () => {
  try {
    const response = await axios.post('http://localhost:3001/export-logs', { logs });
    notify(response.data.message);
  } catch (error) {
    console.error(error);
    notify('Error exporting logs to file');
  }
};

  return (
<div class='bg-light'>
      <nav class="navbar navbar-light bg-dark">
  <div class="container">
    <span class="navbar-brand mb-0 h1 bg-dark">ADBWeb</span>
  </div>
</nav>

<div class="container-sm">
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
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        >
        <CircularProgress color="inherit" />
      </Backdrop>
      {open && <Backdrop/>}
    </form>
    <div class="mb-3">
      <label for="logTextArea" class="form-label">Logs:</label>
      <textarea class="form-control" 
      id="logTextArea" 
      rows="10" 
      wrap="off" 
      cols="30"
      value={logs.join('\n')}
      readOnly
      ></textarea>
    </div>
      <div>
      <button class="btn btn-primary left" onClick={handleFetchLogs}>Fetch Logs</button>
      &nbsp;
      <button class='btn btn-secondary' onClick={eraseText}>Clear</button>
      &nbsp;
      <button className='btn btn-success' onClick={writeToFile}>Export Logs</button>
      </div>
  </div>
  <ToastContainer />
</div>
      </div>

  );
};

export default App;