import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const App = () => {
  const [apkPath, setApkPath] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("");
  const [connectedDevice, setConnectedDevice] = useState(null);

  const [open, setOpen] = React.useState(false);

  const notify = (req) => toast(req);

  useEffect(() => {
    const fetchDeviceID = async () => {
      try {
        const response = await axios
          .get("http://localhost:3001/device-id")
          .then((response) => {
            if (response.data && response.data.deviceID) {
              setDeviceId(response.data.deviceID);
              notify(`Device : ${response.data.deviceID} connected`);
              // alert(`Device : ${response.data.deviceID} connected`)
            }
          })
          .catch((err) => {
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
      const response = await axios.get("http://localhost:3001/install-apk", {
        params: { apkPath: apkPath },
      });
      // alert(response.data)
      notify(response.data);
      // alert(`Installed APK: ${response.data} on device: ${response.data}`);

      // Clear the input field after successful installation
      setApkPath("");

      // Update the device ID after successful installation
      // setDeviceId(response.data.deviceId);
    } catch (error) {
      if (error.response) {
        console.error(
          "Error:",
          error.response.status,
          error.response.statusText
        );
        if (error.response.data && error.response.data.error) {
          // alert(`Error occurred while installing APK: ${error.response.data.error}`);
          notify(
            `Error occurred while installing APK: ${error.response.data.error}`
          );
          setDeviceId("");
        } else {
          // alert(`Error occurred while installing APK: ${error.response.status} ${error.response.statusText}`);
          notify(
            `Error occurred while installing APK: ${error.response.status} ${error.response.statusText}`
          );
        }
      } else if (error.request) {
        console.error("Error:", "No response received from the server.");
        notify(
          "Error occurred while installing APK: No response received from the server."
        );
        // alert('Error occurred while installing APK: No response received from the server.');
      } else {
        console.error("Error:", error.message);
        alert(`Error occurred while installing APK: ${error.message}`);
      }

      setApkPath("");
    }
    setOpen(false);
  };

  const handleFetchLogs = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/device-logs");
      console.log(response);
      // setLogs(response.data.logs);
      setError("");
      setOpen(false);
    } catch (error) {
      console.log("Here   ", error);
      if (error.message === "Network Error") {
        notify("Device Connection Failed");
      } else {
        if (error.response.data) {
          setLogs(error.response.data.logs);
          notify("Logs taken successfully!");
        }
        // setLogs(error.response.data.logs);
        //   // setLogs(error.response.data.logs);
        //   setError('Error fetching logs');
      }
    }
    setOpen(false);
    setLoading(false);
  };

  // function eraseText() {
  //   document.getElementById("logTextArea").value = "";
  // }

  // const writeToFile = async () => {
  //   try {
  //     const response = await axios.post("http://localhost:3001/export-logs", {
  //       logs,
  //     });
  //     notify(response.data.message);
  //   } catch (error) {
  //     console.error(error);
  //     notify("Error exporting logs to file");
  //   }
  // };
  const fetchLogs = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/device-logs");
      setLogs(response.data.logs);
      notify("Logs fetched successfully!");
    } catch (error) {
      console.log("Error fetching logs:", error);
      notify("Error fetching logs");
    }
    setLoading(false);
    setOpen(false);
  };

  const eraseText = () => {
    setLogs([]);
  };

  const writeToFile = async () => {
    try {
      const response = await axios.post("http://localhost:3001/export-logs", {
        logs,
      });
      notify(response.data.message);
    } catch (error) {
      console.error("Error exporting logs to file:", error);
      notify("Error exporting logs to file");
    }
  };

  const handleExportLogs = async () => {
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "logs.txt";

    // Trigger the download by programmatically clicking the anchor element
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  //////////////////////////////////////////////////////////////////
  const connectToDevice = async () => {
    try {
      console.log("here");
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3001/connect-device",
        {
          ipAddress: ipAddress,
          port: parseInt(port), // Convert port to integer
        }
      );
      // console.log(`ip: ${ipAddress} of type ${typeof(ipAddress)}`);
      // console.log(`port: ${port} of type ${typeof(port)}`);
      setConnectedDevice(response.data.device);
      console.log(response.data.device);
      alert(`Connected to device: ${response.data.device}`);
      // notify(`Connected to device: ${response.data.deviceInfo.id}`);
    } catch (error) {
      console.log("Error connecting to device:////", error);
      // notify('Failed to connect to device');
      alert("Failed to connect to device");
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await axios.post("http://localhost:3001/disconnect");
      // Check if the response status is in the 2xx range (indicating success)
      if (response.status >= 200 && response.status < 300) {
        notify("Device disconnected successfully");
      } else {
        // Handle unexpected status codes
        console.error("Unexpected response status:", response.status);
        notify("Failed to disconnect device");
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error("Error disconnecting device:", error);
      notify("Failed to disconnect device");
    } finally {
      window.location.reload();
    }
  };

  ////////////////////////////////////////////////////////////////

  return (
    <div style={{ background: "#EEEDEB" }}>
      <nav className="navbar" style={{ background: "#3C3633" }}>
        <div className="container">
          <span className="navbar-brand h1" style={{ color: "#EEEDEB" }}>
            ADBWeb
          </span>
        </div>
      </nav>

      <div className="container-sm" style={{ padding: 100 }}>
        <div
          className="card text-white mb-3"
          style={{
            padding: 50,
            borderRadius: 80,
            background: "#3C3633",
            borderColor: "#E0CCBE",
            borderWidth: 2,
          }}
        >
          <div className="card-body container-sm">
            <div className="jumbotron">
              {!deviceId && (
                <div className="IP">
                  <h6>Connect to Device</h6>
                  <div className="d-flex" style={{ gap: 16 }}>
                    <div>
                      <input
                        type="text"
                        className="form-control"
                        // style={{ width: "50%" }}
                        value={ipAddress}
                        placeholder="Enter IP address"
                        onChange={(e) => setIpAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="form-control"
                        // style={{ width: "25%" }}
                        value={port}
                        placeholder="Enter port"
                        onChange={(e) => setPort(e.target.value)}
                      />
                    </div>
                    <button
                      className={`button-34 ${
                        !(ipAddress.trim() && port.trim()) ? "" : "valid"
                      }`}
                      style={{ background: "#5E5DF0", height: "50" }}
                      onClick={connectToDevice}
                      disabled={loading}
                    >
                      {loading ? "Connecting..." : "Connect"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div>
                  <label htmlFor="deviceId" className="form-label">
                    <h6>Device ID:</h6>
                  </label>

                  {deviceId ? (
                    <div className="d-flex">
                      <div>{deviceId}</div>
                      <div>
                        <button
                          className="button-65"
                          onClick={handleDisconnect}
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span>No device connected</span>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="apkPath" className="form-label">
                  <h6>APK Path:</h6>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="apkPath"
                  value={apkPath}
                  onChange={(e) => setApkPath(e.target.value)}
                />
              </div>
              <button
                className={`button-34 ${!apkPath.trim() ? "" : "valid"}`}
                type="submit"
                disabled={!apkPath.trim()}
              >
                Install APK
              </button>
              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={open}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
              {open && <Backdrop />}
            </form>
            <div className="mb-3">
              <label htmlFor="logTextArea" className="form-label">
                <h6>Logs:</h6>
              </label>
              {logs.length === 0 ? (
                <p>No Logs found</p>
              ) : (
                <textarea
                  className="form-control"
                  id="logTextArea"
                  rows="10"
                  wrap="off"
                  cols="30"
                  value={logs.join("\n")}
                  readOnly
                ></textarea>
              )}
            </div>
            <div className="flex-box" style={{ gap: 16 }}>
              <button className="button-34 valid" onClick={handleFetchLogs}>
                Fetch Logs
              </button>
              &nbsp;
              <button
                className={`button-34 ${!logs.length ? "" : "valid"}`}
                disabled={!logs.length}
                onClick={eraseText}
              >
                Clear
              </button>
              &nbsp;
              <button
                className={`button-34 ${!logs.length ? "" : "valid"}`}
                onClick={handleExportLogs}
                disabled={!logs.length}
              >
                Save Logs
              </button>
            </div>
          </div>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default App;
