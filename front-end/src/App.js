import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./style.css";
import "./modalcss.scss";
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
  const [analysedLog, setAnalysedLog] = useState("No logs found");

  const notify = (req) => toast(req);

  useEffect(() => {
    // Function to handle SSE events
    const handleSSE = (event) => {
      console.log(event);

      const eventData = JSON.parse(event.data);
      setDeviceId(eventData.deviceID);
    };

    // Open SSE connection
    const eventSource = new EventSource(
      "http://localhost:3001/device-id-stream"
    );
    eventSource.addEventListener("message", handleSSE);

    // Cleanup
    return () => {
      eventSource.close();
    };
  }, []);

  //INSTALL APP
  const handleSubmit = async (event) => {
    event.preventDefault();
    setOpen(true);

    try {
      const response = await axios.get("http://localhost:3001/install-apk", {
        params: { apkPath: apkPath },
      });
      // alert(response.data)
      notify(response.data);
      // alert(`Installed APK: ${response.data} on device: ${response.data}`);
      setApkPath("");
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
          notify(
            `Error occurred while installing APK: ${error.response.status} ${error.response.statusText}`
          );
        }
      } else if (error.request) {
        console.error("Error:", "No response received from the server.");
        notify(
          "Error occurred while installing APK: No response received from the server."
        );
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
          console.log(error.response.data.logs[0]);
          var logString = JSON.stringify(error.response.data.logs);
          // logString = logString.replace(/,(?=\s*["\w]+:)/g, ",\\n");
          var logsArray = JSON.parse(logString);
          var formattedLogs = "";
          logsArray.forEach(function (log) {
            formattedLogs += log.Date + "\n" + log.Message + "\n\n";
          });
          // console.log(logString);
          // setLogs(formattedLogs);
          setLogs(error.response.data.logs[0].Message);
          notify("Logs taken successfully!");
        }
      }
    }
    setOpen(false);
    setLoading(false);
  };

  const handleAnalyseLogs = () => {
    console.log("here");
    const javaExceptions = {
      "java.lang.ArithmeticException":
        "Occurs when an arithmetic operation results in an error, such as division by zero.",
      "java.lang.ArrayIndexOutOfBoundsException":
        "Occurs when attempting to access an array element at an invalid index.",
      "java.lang.ArrayStoreException":
        "Occurs when trying to store an element of an incompatible type in an array.",
      "java.lang.ClassCastException":
        "Occurs when attempting to cast an object to a type that is not compatible with its actual type.",
      "java.lang.ClassNotFoundException":
        "Occurs when trying to access a class that doesn't exist.",
      "java.lang.CloneNotSupportedException":
        "Occurs when attempting to clone an object that does not implement the Cloneable interface.",
      "java.lang.EnumConstantNotPresentException":
        "Occurs when an enum constant does not exist.",
      "java.lang.IllegalAccessException":
        "Occurs when accessing a field or invoking a method without proper access permissions.",
      "java.lang.IllegalArgumentException":
        "Occurs when a method is passed an argument of an illegal or inappropriate type.",
      "java.lang.IllegalMonitorStateException":
        "Occurs when a thread attempts to wait, notify, or notifyAll on an object that it does not own.",
      "java.lang.IllegalStateException":
        "Occurs when the state of an object is not consistent with the operation being attempted.",
      "java.lang.IllegalThreadStateException":
        "Occurs when a thread is not in an appropriate state for the requested operation.",
      "java.lang.IndexOutOfBoundsException":
        "Occurs when attempting to access an index outside the bounds of a data structure, such as an array or a string.",
      "java.lang.InstantiationException":
        "Occurs when attempting to instantiate an abstract class or an interface, or when the instantiation of a class fails for some other reason.",
      "java.lang.InterruptedException":
        "Occurs when a thread is interrupted while it is in a blocking operation, such as waiting for I/O or sleeping.",
      "java.lang.NegativeArraySizeException":
        "Occurs when attempting to create an array with a negative size.",
      "java.lang.NoSuchFieldException":
        "Occurs when attempting to access a field that does not exist.",
      "java.lang.NoSuchMethodException":
        "Occurs when attempting to access a method that does not exist.",
      "java.lang.NullPointerException":
        "Occurs when attempting to access or dereference a null object.",
      "java.lang.NumberFormatException":
        "Occurs when attempting to convert a string to a numeric type, but the string does not have the appropriate format.",
      "java.lang.ReflectiveOperationException":
        "A general exception type that encompasses various reflection-related exceptions, such as ClassNotFoundException, NoSuchFieldException, and NoSuchMethodException.",
      "java.lang.RuntimeException":
        "A general exception type that serves as the superclass of all unchecked exceptions.",
      "java.lang.SecurityException":
        "Occurs when a security violation is detected.",
      "java.lang.StringIndexOutOfBoundsException":
        "Occurs when attempting to access a character at an index that is out of range for a string.",
      "java.lang.TypeNotPresentException":
        "Occurs when attempting to access a type that does not exist at runtime due to a missing dependency.",
      "java.lang.UnsupportedOperationException":
        "Occurs when attempting to perform an operation that is not supported, typically in the context of an immutable object or an unmodifiable collection.",
      "java.lang.VirtualMachineError":
        "A superclass of errors that occur within the Java Virtual Machine.",
      "java.lang.InternalError":
        "Indicates an unexpected condition within the Java Virtual Machine.",
      "java.lang.ExceptionInInitializerError":
        "Thrown by the JVM when an exception occurs during the evaluation of a static initializer or the initializer for a static variable.",
      "java.lang.OutOfMemoryError":
        "Thrown when the Java Virtual Machine cannot allocate an object because it is out of memory, and no more memory could be made available by the garbage collector.",
      "java.lang.StackOverflowError":
        "Thrown when the Java Virtual Machine detects that the application's thread stack is exhausted, due to deep recursion.",
      "java.lang.NoClassDefFoundError":
        "Thrown if the Java Virtual Machine or a ClassLoader instance tries to load in the definition of a class (as part of a normal method call or as part of creating a new instance using the new expression) and no definition of the class could be found.",
      "java.lang.LinkageError":
        "A superclass of all errors that occur when loading and linking class files.",
    };
    var current_message = logs;
    var a;
    console.log(current_message);
    if (current_message.indexOf("java") !== -1) {
      a = current_message.indexOf("java");
      console.log(a);
    } else {
      return;
    }

    var s = "";
    while (current_message[a] !== ":") {
      s += current_message[a];
      a++;
    }

    for (let x in javaExceptions) {
      if (x === s) {
        console.log(javaExceptions[s]);
        setAnalysedLog(s + " : " + javaExceptions[s]);
      }
    }
  };

  const eraseText = () => {
    setLogs([]);
    setAnalysedLog("No logs found");
  };

  const handleExportLogs = async () => {
    const blob = new Blob([logs], { type: "text/plain" });
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

  //STB Connection through ipAddress and Port
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
      setConnectedDevice(response.data.device);
      console.log(response.data.device);
      notify(`Connected to device: ${response.data.deviceInfo.id}`);
    } catch (error) {
      console.log("Error connecting to device: ", error);
      notify("Failed to connect to device");
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  //Disconnecting STB
  const handleDisconnect = async () => {
    try {
      const response = await axios.post("http://localhost:3001/disconnect");
      if (response.status >= 200 && response.status < 300) {
        notify("Device disconnected successfully");
      } else {
        console.error("Unexpected response status:", response.status);
        notify("Failed to disconnect device");
      }
    } catch (error) {
      console.error("Error disconnecting device:", error);
      notify("Failed to disconnect device");
    } finally {
      window.location.reload();
    }
  };

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
                    <div className="d-flex" style={{ gap: 16 }} readOnly>
                      {/* <div>{"deviceId"}</div> */}
                      <div>
                        <input
                          type="text"
                          className="form-control"
                          value={deviceId}
                        />
                      </div>
                      <div>
                        {!(deviceId.indexOf(":") === -1) && (
                          <button
                            className="button-34"
                            onClick={handleDisconnect}
                          >
                            Disconnect
                          </button>
                        )}
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
                  value={logs}
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
              &nbsp;
              {/* /////////////MODAL//////////// */}
              <a
                href="#modal"
                role="button"
                class="button-34"
                disabled={!logs.length}
                style={{ textDecoration: "none" }}
                onClick={handleAnalyseLogs}
              >
                Analyse Logs
              </a>
              {/* <!-- Modal --> */}
              <div class="modal-wrapper" id="modal">
                <div class="modal-body card">
                  <div class="modal-header">
                    <h2 class="heading"></h2>
                    <a
                      href="#!"
                      role="button"
                      class="close"
                      aria-label="close this modal"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
                      </svg>
                    </a>
                  </div>
                  <p style={{ color: "black" }}>{analysedLog}</p>
                </div>
                <a href="#!" class="outside-trigger"></a>
              </div>
              {/* ///////////////////////// */}
            </div>
          </div>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default App;
