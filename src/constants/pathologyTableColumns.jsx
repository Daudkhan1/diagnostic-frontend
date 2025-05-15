import {
  ViewTableButtonIcon,
  // DashInactiveIcon,
  // DashTotalCasesIcon,
  // DashInProgressIcon,
  // DashCompletedIcon,
} from "@/assets/svg";
import { Button } from "@/components/common";
import { capitalizeValue } from "@/utils/helpers";

export const pathologyTableColumns = (handleNavigate, handleDateSort, sort) => {
  return [
    {
      title: "Case No.",
      dataIndex: "case",
      key: "case",
      width: "15%",
    },
    {
      title: "Patient ID",
      dataIndex: "patientID",
      key: "patientID",
      width: "13%",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: "12%",
      render: (_, record) => <p>{capitalizeValue(record.gender)}</p>,
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: "10%",
      render: (_, record) => <p>{`${record.age} yrs`}</p>,
    },
    {
      title: "Slide Type",
      dataIndex: "slideType",
      key: "slideType",
      width: "10%",
      render: (_, record) => (
        <p className="bold-table-content">{record.slideType}</p>
      ),
    },
    {
      title: "Number of Slides",
      dataIndex: "slideNumber",
      key: "slideNumber",
      width: "10%",
      render: (_, record) => (
        <p className="bold-table-content">{record.slideNumber}</p>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: "15%",
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
      title: "Actions",
      key: "action",
      width: "15%",
      className: "actions-cell",
      render: (_, record) => (
        <section className="table-actions-container">
          <Button
            buttonType="textOnly"
            // title="View"
            icon={<ViewTableButtonIcon />}
            classes="view-action-button"
            handleClick={() => handleNavigate(record)}
          />
        </section>
      ),
    },
  ];
};
