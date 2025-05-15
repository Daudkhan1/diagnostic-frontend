import { Tag } from "antd";
import { EditTableButtonIcon, ViewTableButtonIcon } from "@/assets/svg";
import { Button, Switch } from "@/components/common";

import {
  DashInactiveIcon,
  DashTotalCasesIcon,
  DashInProgressIcon,
  DashCompletedIcon,
} from "@/assets/svg";

export const userManagementCards = (userCountData = {}) => [
  {
    icon: <DashTotalCasesIcon />,
    metrics: userCountData.totalUsers ?? 0,
    title: "Users",
  },
  {
    icon: <DashInProgressIcon />,
    metrics: userCountData.activeUsers ?? 0,
    title: "Active Users",
  },
  {
    icon: <DashInactiveIcon />,
    metrics: userCountData.inactiveUsers ?? 0,
    title: "Inactive Users",
  },
  {
    icon: <DashCompletedIcon />,
    metrics: userCountData.rejectedUsers ?? 0,
    title: "Rejected Users",
  },
];

export const userManagementTableOptions = [
  {
    label: "All",
    value: "",
  },
  {
    label: "New",
    value: "NEW",
  },
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "InActive",
    value: "INACTIVE",
  },
  // {
  //   label: "Rejected",
  //   value: "REJECTED",
  // },
];

export const userManagementTableColumns = ({
  handleShowUserDetails,
  handleChangeUserStatus,
}) => {
  return [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "5%",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      className: "name-cell",
      ellipsis: true,
      width: "12%",
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      width: "18%",
    },
    {
      title: "User Type",
      dataIndex: "userType",
      key: "userType",
      ellipsis: true,
      width: "8%",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
      ellipsis: true,
      width: "12%",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      ellipsis: true,
      width: "13%",
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      className: "status-cell",
      width: "13%",
      render: (_, record) => {
        const { status } = record;

        const tagType = (name) => {
          if (name === "ACTIVE") {
            return "active";
          } else if (name === "INACTIVE") {
            return "inactive";
          } else {
            return "";
          }
        };

        return (
          <section className="table-tags-column">
            <Tag className={tagType(status)}>{status}</Tag>

            {(status === "ACTIVE" || status === "INACTIVE") && (
              <Switch
                classes="small-switch"
                checked={status === "ACTIVE"}
                onChange={() =>
                  handleChangeUserStatus(record.uniqueId, record.status)
                }
              />
            )}
          </section>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: "19%",
      className: "actions-cell",
      render: (_, record) => (
        <section className="table-actions-container">
          <Button
            buttonType="textOnly"
            // title="View"
            icon={<ViewTableButtonIcon />}
            classes="view-action-button"
            handleClick={() => handleShowUserDetails(record)}
          />

          {/* {record.status !== "NEW" && (
            <Button
              buttonType="textOnly"
              // title="Edit"
              icon={<EditTableButtonIcon />}
              classes="edit-action-button"
            />
          )} */}

          {record.status === "NEW" && (
            <>
              <Button
                title="Accept"
                classes="common-action-button accept-button"
                handleClick={() =>
                  handleChangeUserStatus(record.uniqueId, "INACTIVE")
                }
              />

              <Button
                title="Reject"
                classes="common-action-button reject-button"
                handleClick={() =>
                  handleChangeUserStatus(record.uniqueId, "ACTIVE")
                }
              />
            </>
          )}
        </section>
      ),
    },
  ];
};
