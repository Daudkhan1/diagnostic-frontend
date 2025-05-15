// import { Tag } from "antd";

import {
  // EditTableButtonIcon,
  ViewTableButtonIcon,
  // DeleteTableButtonIcon,
  DashInactiveIcon,
  DashTotalCasesIcon,
  DashInProgressIcon,
  DashCompletedIcon,
  AssignIcon,
  UnAssignIcon,
  TransferCaseIcon,
  CheckSquareIcon,
} from "@/assets/svg";
import { Button } from "@/components/common";
import { capitalizeValue } from "@/utils/helpers";

export const annotationCards = (caseStats) => {
  return [
    {
      icon: <DashTotalCasesIcon />,
      metrics: caseStats?.total || 0,
      title: "Total Cases",
    },
    {
      icon: <DashInProgressIcon />,
      metrics: caseStats?.newCases || 0,
      title: "New Cases",
    },
    {
      icon: <DashInactiveIcon />,
      metrics: caseStats?.inProgress || 0,
      title: "InProgress Cases",
    },
    {
      icon: <DashCompletedIcon />,
      metrics: caseStats?.referred || 0,
      title: "Transferred Cases",
    },
    {
      icon: <DashTotalCasesIcon />,
      metrics: caseStats?.incoming || 0,
      title: "Incoming Referrals",
    },
    {
      icon: <DashTotalCasesIcon />,
      metrics: caseStats?.completed || 0,
      title: "Completed Cases",
    },
  ];
};

export const radiologistTableOptions = (role) => {
  return [
    {
      label: "New",
      value: "NEW",
    },
    {
      label: "InProgress",
      value: "IN_PROGRESS",
    },
    {
      label: "Transferred Cases",
      value: "REFERRED",
    },
    {
      label: "Incoming Referrals",
      value: "IN_COMING",
    },
    {
      label: "Completed",
      value: "COMPLETE",
    },
  ];
};

export const radiologistTableColumns = ( 
  handleGoToCase,
  handleDateSort,
  sort,
  type,
  showAssignModal,
  showUnassignModal,
  showTransferModal,
  showCompleteModal
) => {
  return [
    {
      title: "Patient ID",
      dataIndex: "patientID",
      key: "patientID",
      width: (type === "REFERRED" || type === "IN_COMING" || type === "COMPLETE") ? "12%" : "15%",
    },
    {
      title: "Case ID",
      dataIndex: "case",
      key: "case",
      width: (type === "REFERRED" || type === "IN_COMING" || type === "COMPLETE") ? "14%" : "15%",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: type === "REFERRED" || type === "IN_COMING" ? "7%" : type === "COMPLETE" ? "8%" : "10%",
      render: (_, record) => (
        <p className="bold-table-content">{capitalizeValue(record.gender)}</p>
      ),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: type === "REFERRED" || type === "COMPLETE" ? "7%" : type === "IN_COMING" ? "6%" : "10%",
      render: (_, record) => <p>{`${record.age}yrs`}</p>,
    },
    ...(type === "REFERRED" || type === "COMPLETE"
      ? [
          {
            title: "Transferred to",
            dataIndex: "transferredTo",
            key: "transferredTo",
            width: type === "COMPLETE" ? "10%" : "15%",
            render: (_, record) =>  <p>{record.transferredTo?.fullName || "---"}</p>,
          },
        ]
      : []),
    ...(type === "IN_COMING" || type === "COMPLETE"
      ? [
          {
            title: "Transferred by",
            dataIndex: "transferredBy",
            key: "transferredBy",
            width: type === "COMPLETE" ? "10%" : "15%",
            render: (_, record) => <p>{record.transferredBy?.fullName || "---"}</p>,
          },
        ]
      : []),
    {
      title: "Organ",
      dataIndex: "organ",
      key: "organ",
      width: (type === "REFERRED" || type === "IN_COMING" || type === "COMPLETE") ? "12%" : "15%",
      render: (_, record) => {
        const organsList = record && record.slides?.map((item) => item.organ);

        if (organsList?.length > 0) {
          return (
            <section className="organ-list-cell">
              <p
                key={0}
                className={`status-box status-box-${0}`}
                title={organsList[0]}
              >
                {organsList[0]}
              </p>

              {organsList.length > 1 && (
                <p
                  className="more-organs-label"
                  title={organsList.slice(1).length}
                >
                  +{organsList.slice(1).length}
                </p>
              )}
            </section>
          );
        } else return "---";
      },
    },
    ...(type === "REFERRED" 
    ? [
        {
          title: "Transferred date",
          dataIndex: "transferredDate",
          key: "transferredDate",
          width: "14%",
          render: (_, record) => <p>{record.transferredTo?.transferredDate || "---"}</p>,
        },
      ]
    : []),
    
    ...(type === "IN_COMING" 
    ? [
        {
          title: "Transferred date",
          dataIndex: "transferredDate",
          key: "transferredDate",
          width: "11%",
          render: (_, record) => <p>{record.transferredBy?.transferredDate || "---"}</p>,
        },
      ]
    : []),

    ...(type === "COMPLETE" 
    ? [
        {
          title: "Completed date",
          dataIndex: "completedDate",
          key: "completedDate",
          width: "11%",
          render: (_, record) => <p>{record.transferredBy?.transferredDate || "---"}</p>,
        },
      ]
    : []),
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: type === "REFERRED" ? "13%" : "10%",
      showSorterTooltip: false,
      sorter: true,
      sortOrder:
        sort === "date,asc"
          ? "ascend"
          : sort === "date,desc"
          ? "descend"
          : null,
      onHeaderCell: () => ({
        onClick: () => {
          handleDateSort(
            sort === "date,asc"
              ? "descend"
              : sort === "date,desc"
              ? null
              : "ascend"
          );
        },
      }),
    },
    {
      title: "Action",
      key: "action",
     width: type === "REFERRED" || type === "COMPLETE" ? "6%" : type === "IN_COMING" ? "13%" : "25%",
      className: "actions-cell",
      render: (_, record) => (
        <section className="table-actions-container">
          <Button
            buttonType="textOnly"
            // title="View"
            icon={<ViewTableButtonIcon />}
            classes="view-action-button"
            handleClick={() => handleGoToCase(record)}
          />

          {type === "NEW" && (
            <Button
              icon={<AssignIcon />}
              classes="table-rounded-buttons"
              title="Assign to me"
              handleClick={() => showAssignModal(record)}
            />
          )}

          {type === "IN_PROGRESS" && (
            <>
              <Button
                icon={<UnAssignIcon />}
                classes="table-rounded-buttons error"
                title="Unassign"
                handleClick={() => showUnassignModal(record)}
              />

              <Button
                icon={<TransferCaseIcon />}
                classes="table-rounded-buttons"
                title="Transfer Case"
                handleClick={() => showTransferModal(record)}
              />
            </>
          )}

          {record?.incoming && (
            <Button
              icon={<CheckSquareIcon />}
              classes="table-rounded-buttons success"
              title="Complete Case"
              handleClick={() => showCompleteModal(record)}
            />
          )}

          {/* <Button
            buttonType="textOnly"
            title="Edit"
            icon={<EditTableButtonIcon />}
            classes="edit-action-button"
          />

          <Button
            buttonType="textOnly"
            title="Delete"
            icon={<DeleteTableButtonIcon />}
            classes="delete-action-button"
          /> */}
        </section>
      ),
    },
  ];
};
