const express = require('express');
const bodyParser = require('body-parser');
const adb = require('adbkit');
const logcat = require('adbkit-logcat')
const { spawn } = require('child_process');
const client = adb.createClient();
var cors = require('cors');
const fs = require('fs');

const app = express();

app.use(bodyParser.json());
const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(cors(corsOpts));

//FETCHING DEVICE ID PART

const getDeviceID = async () => {
  try {
    const devices = await client.listDevices();
    if (devices.length > 0) {
      return devices[0].id;
    }
    return null;
  } catch (error) {
    console.error('Something went wrong:', error.stack);
    return null;
  }
};

app.get('/device-id', async(req, res) => {
  try{
    const deviceID = await getDeviceID();
    if(deviceID){
      console.log('Device ID retrived', deviceID);
      res.status(200).json({deviceID});
    }
    else {
      console.log('No Device found');
      res.status(404).json({error:'NO device found'});
    }
  }catch(error){
    console.error('Error retrieving device ID', error);
    res.status(500).json({error:'Something went wrong'});
  } 
});

//LOGS PART
app.get('/device-logs', async (req, res) => {
  try {
    const proc = spawn('adb', ['logcat', '-B', 'all', '*:F', '*:E']);
    const reader = logcat.readStream(proc.stdout);
    let crashDetected = false;
    let logs = [];

    reader.on('entry', entry => {
      console.log(entry);
      // if (entry.priority === 'F' || entry.priority === 'E' || entry.message.includes('com.jio.photos')) {
      if (entry.priority === 7 || entry.priority === 6) {
        console.log('Crash detected');
        console.log(entry.message);
        logs.push(entry.message);
        crashDetected = true;
        proc.kill();
      }
    });

    let responseSent = false;

    await new Promise((resolve, reject) => {
      proc.on('exit', (code, signal) => {
        console.log(`Logcat process exited with code ${code} and signal ${signal}`);
        if (!crashDetected && !responseSent) {
          console.log('No crash detected');
          responseSent = true;
          res.status(200).json({ logs: logs, message: 'No crash detected' });
          resolve();
        }
      });

      reader.on('end', () => {
        if (crashDetected && !responseSent) {
          responseSent = true;
          res.status(500).json({ logs: logs, message: 'Crash detected' });
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'An error occurred while fetching device logs' });
  }
});
// app.get('/device-logs', (req, res) => {
//   const proc = spawn('adb', ['logcat', '-B', 'all' , '*:F', '*:E']);

//   // Connect logcat to the stream
//   const reader = logcat.readStream(proc.stdout);

//   let crashDetected = false; // Flag to track if a crash is detected
//   let logs=[]

//   // Event handler for logcat entries
//   reader.on('entry', entry => {
//     console.log(entry);
    
//     // Check if the log entry indicates a crash
//     if (entry.priority === 'F' || entry.priority === 'E' || entry.message.includes('com.jio.photos')) {
//       console.log('Crash detected');
//       console.log(entry.message);

//       logs.push(entry.message);
//       crashDetected = true;
//       proc.kill(); // Kill the logcat process
//     }
//   });

//   let responseSent = false; // Flag to track whether response has been sent

//   proc.on('exit', (code, signal) => {
//       console.log(`Logcat process exited with code ${code} and signal ${signal}`);
  
//       // If the process exited but no crash was detected and response hasn't been sent yet, handle it here
//       if (!crashDetected && !responseSent) {
//           // Handle the case where logcat exited without detecting a crash
//           console.log('No crash detected');
//           responseSent = true; // Set flag to true to indicate response has been sent
//           res.status(200).json({ logs: logs, message: 'No crash detected' });
//       }
//   });
  
//   // Send response if a crash is detected and response hasn't been sent yet
//   reader.on('end', () => {
//       if (crashDetected && !responseSent) {
//           responseSent = true; // Set flag to true to indicate response has been sent
//           res.status(500).json({ logs: logs, message: 'Crash detected' });
//       }
//   });
// });


//INSTALL PART
app.get('/install-apk', async (req, res) => {
  // console.log(req.query.apk)
  const devices = await client.listDevices();

    if (devices.length === 0) {
      res.status(404).json({error:'No devices connected'});
      
      return;
    }
  
  const apk = req.query.apkPath;
  if (!apk) {
    res.status(400).json({error:'Missing APK path'});
    return;
  }

  try {
    const devices = await client.listDevices();
    const device = devices[0];

    await client.install(device.id, apk);

    console.log(`Installed ${apk} on device ${device.id}`);
    res.send(`Installed ${apk} on device ${device.id}`);
  } catch (err) {
    console.error('Lost Connection with Device', err.stack);
    res.status(500).json({error:'Lost Connection with Device'});
  }
});

app.post('/export-logs', (req, res) => {
  try {
    const logs = req.body.logs;
    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: 'Logs data is missing or invalid' });
    }

    const fileName = 'device_logs.txt'; // Name of the file to be exported
    const filePath = './logs' + '/' + fileName; // Path where the file will be saved

    // Write logs data to the file
    const data = logs.join('\n'); // Join log messages with newline character
    fs.writeFile(filePath, data, err => {
      if (err) {
        console.error('Error writing logs to file:', err);
        return res.status(500).json({ error: 'An error occurred while exporting logs' });
      }
      console.log('Logs have been exported to file:', fileName);
      res.status(200).json({ message: 'Logs exported successfully', file: fileName });
    });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'An error occurred while exporting logs' });
  }
});


app.listen(3001, () => {
  console.log('App listening on port 3001!');
});