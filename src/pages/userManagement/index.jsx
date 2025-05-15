import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import _ from "lodash";

import { PlusIcon } from "@/assets/svg";
import { DashboardTemplate, DashboardCard } from "@/components";
import { Radio, Table, Modal, Button, Input } from "@/components/common";
import UserDetailsDrawer from "./components/userDetailsDrawer";

import {
  userManagementCards,
  userManagementTableOptions,
  userManagementTableColumns,
} from "@/constants/userManagementTableColumns";
import { getUserRole, updateStatus } from "./userManagementUtils";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getUserCounts,
} from "../../services/userServices";

const UserManagement = () => {
  const location = useLocation();

  const role = getUserRole(location);

  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [currentUser, setCurrentUser] = useState();
  const [search, setSearch] = useState("");
  const [currentAlert, setCurrentAlert] = useState({
    id: "",
    status: "",
  });
  const [userCountData, setUserCountData] = useState({});
  const [alert, setAlert] = useState(false);
  const [reset, setReset] = useState(false);
  const [userStatus, setUserStatus] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState({
    current: 0,
    total: 0,
  });

  const handleStatusChange = (e) => {
    const statusSelected = e.target.value;
    setUserStatus(() => statusSelected);
  };

  const handlePagination = (page) => {
    fetchData(page - 1, search);
  };

  const fetchData = async (pageNo, searchValue) => {
    const currentStatus = userStatus ? `status=${userStatus}&` : "";
    const searched = searchValue ? `&fullname=${searchValue}` : "";
    const currentPage = pageNo ?? page.current;

    setLoading(() => true);

    try {
      const usersList = await getAllUsers(
        `?${currentStatus}role=${role}&size=${page.total}&page=${
          pageNo ?? page.current
        }${searched}`
      );

      if (usersList?.content) {
        const mappedTableRows = usersList.content.map((row, index) => {
          return {
            key: row.id,
            uniqueId: row.id,
            name: row.fullName || "-",
            email: row.email || "-",
            userType: row.role || "-",
            contactNumber: row.phoneNumber || "-",
            date: row.registrationDate || "-",
            // status: "ACTIVE",
            status: row.status,
          };
        });

        setTableData(() => mappedTableRows);
        setPage((st) => ({
          ...st,
          total: usersList?.totalElements,
          current: currentPage,
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(() => false);
    }
  };

  const getUsersCardsData = async () => {
    try {
      const response = await getUserCounts(role);
      setUserCountData(response);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    getUsersCardsData();
  }, [role, userStatus, reset]);

  const handleChangeUserStatus = (uniqueId, status) => {
    setAlert(() => true);

    setCurrentAlert(() => ({
      id: uniqueId,
      status: status,
    }));
  };

  const handleUpdateStatus = async () => {
    try {
      const currentStatus =
        currentAlert.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      await updateUserStatus(currentAlert.id, currentStatus);

      hideAlert();
      handleHideUserDetails();

      setTimeout(() => {
        setReset((st) => !st);
      }, 300);
    } catch (error) {
      console.log(error);
    }
  };

  const hideAlert = () => {
    setAlert(() => false);
  };

  const handleSearchDebounce = useCallback(
    _.debounce((searchValue) => fetchData(0, searchValue), 500),
    []
  );

  const handleSearch = (e) => {
    let value = e.target.value;
    setSearch(() => value);

    handleSearchDebounce(value);
  };

  const handleShowUserDetails = (userData) => {
    setCurrentUser(() => userData);
    setShowUserDetails(() => true);
  };

  const handleHideUserDetails = () => {
    setShowUserDetails(() => false);
  };

  return (
    <DashboardTemplate heading="User Management">
      {alert && (
        <Modal
          title="Alert"
          alertIcon
          open={alert}
          onCancel={hideAlert}
          footer={[
            <Button title="No" classes="simple" handleClick={hideAlert} />,
            <Button title="Yes" handleClick={handleUpdateStatus} />,
          ]}
        >
          <p className="status-update">
            Are you sure you want to
            <span
              className={`status ${
                currentAlert.status === "ACTIVE" ? "danger" : "success"
              }`}
            >
              {" "}
              {updateStatus(currentAlert.status)}{" "}
            </span>
            user?
          </p>
        </Modal>
      )}

      {showUserDetails && (
        <UserDetailsDrawer
          currentUser={currentUser}
          handleHideUserDetails={handleHideUserDetails}
          showUserDetails={showUserDetails}
          role={role}
          handleChangeUserStatus={handleChangeUserStatus}
        />
      )}

      {showAlert && (
        <Modal
          title="Alert"
          alertIcon
          open={showAlert}
          onCancel={() => setShowAlert(false)}
          footer={[
            <Button
              title="No"
              classes="simple"
              handleClick={() => setShowAlert(false)}
            />,
            <Button title="Yes" handleClick={() => setShowAlert(false)} />,
          ]}
        >
          <p className="status-update">
            Are you sure you want to
            <span className="status success"> Active </span>
            user techinician?
          </p>
        </Modal>
      )}

      <section className="admin-cards-list">
        {userManagementCards(userCountData).map((card, index) => (
          <DashboardCard key={`technician-user-card-${index}`} {...card} />
        ))}
      </section>

      <section className="admin-table-fields-container">
        <Radio
          options={userManagementTableOptions}
          value={userStatus}
          onChange={handleStatusChange}
          defaultValue=""
        />

        <article className="table-search-fields-container">
          <Input
            inputType="searchField"
            name="search"
            placeholder="Search by name"
            value={search}
            onChange={handleSearch}
            maxLength={40}
          />

          {/* <Button
            title="Add New Case"
            classes="add-filter-button"
            icon={<PlusIcon />}
            handleClick={showCaseDrawer}
          /> */}
        </article>
      </section>

      <Table
        loading={loading}
        columns={userManagementTableColumns({
          handleShowUserDetails,
          handleChangeUserStatus,
        })}
        data={tableData}
        page={page}
        handlePagination={handlePagination}
        showPagination={false}
      />
    </DashboardTemplate>
  );
};

export default UserManagement;
