import { useState, useEffect } from "react";

import { DashboardTemplate } from "@/components";
import { Switch } from "@/components/common";
import { getEC2Status, changeEC2Status, changeAnonymiserStatus, getAnonymiserStatus } from "@/services/ec2Service";

import "./styles.scss";

const Settings = () => {
  const [status, setStatus] = useState(undefined);
  const [anonymiserStatus, setAnonymiserStatus] = useState(undefined);
  const [reset, setReset] = useState(false);

  const fetchCurrentEC2Status = async () => {
    const response = await getEC2Status();

    setStatus(() => response);
  };

  const fetchAnonymiserStatus = async () => {
    const response = await getAnonymiserStatus();
    setAnonymiserStatus(() => response);
  };

  useEffect(() => {
    fetchCurrentEC2Status();
    fetchAnonymiserStatus();
  }, [reset]);

  const handleChangeStatus = async () => {
    debugger
    const changeStatus = status === true ? false : true;

    const response = await changeEC2Status(changeStatus);

    if (response) {
      setStatus(() => response);
      setReset((st) => !st);
    }
  };

  const handleAnonymiserChange = async () => {
    const changeStatus = anonymiserStatus === true ? false : true;
    const response = await changeAnonymiserStatus(changeStatus);

    if (response) {
      setAnonymiserStatus(() => response);
      setReset((st) => !st);
    }
  };
  

  return (
    <DashboardTemplate heading="Settings">
      <section className="setting-form-inner-container">
        <div className="settings-box">
          <div className="settings-row">
            <p className="settings-box-heading">Manage GPU State</p>
            <Switch
              checked={status}
              onChange={handleChangeStatus}
              checkedChildren="Inactive"
              unCheckedChildren="Active"
            />
          </div>
        </div>

        <div className="settings-box">
          <div className="settings-row">
            <p className="settings-box-heading">Manage Anonymizer State</p>
            <Switch
              checked={anonymiserStatus}
              onChange={handleAnonymiserChange}
              checkedChildren="On"
              unCheckedChildren="Off"
            />
          </div>
        </div>
      </section>
    </DashboardTemplate>
  );
};

export default Settings;
