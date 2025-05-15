import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import _ from "lodash";

import { PlusIcon } from "@/assets/svg";
import { DashboardTemplate, CaseDetailDrawer } from "@/components";
import { Table, Button, Input } from "@/components/common";
import { radiologyTableColumns } from "@/constants/radiologyTableColumns";
import { getAllCases } from "@/services/caseService";
import { RADIOLOGY_MAX_FILE_SIZE } from "@/constants";

const Radiology = () => {
  const navigate = useNavigate();

  const [sort, setSort] = useState(null);
  const [caseDrawer, setCaseDrawer] = useState(false);
  const [tableData, setTableData] = useState();
  const [reset, setReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState({
    size: 10,
    current: 0,
    total: 0,
  });

  const fetchRadiologyTableData = async (pageNo, searchValue) => {
    setLoading(() => true);

    const getSearchedValue = () => {
      if (searchValue ?? search) {
        return `&mrn=${searchValue || search}`;
      } else {
        return "";
      }
    };

    const getSortedValue = () => {
      if (sort) {
        return `&sort=${sort}`;
      }

      return "";
    };

    const currentPage = pageNo ?? page.current;
    const searched = getSearchedValue();
    const sorted = getSortedValue();

    try {
      const casesList = await getAllCases(
        `?type=RADIOLOGY&size=${page.size}&page=${currentPage}${searched}${sorted}`
      );

      const formattedRows = casesList?.content?.map((item) => {
        return {
          ...item,
          key: item.id,
          case: item.caseName,
          patientID: item.patientDetailsDTO.praidId,
          gender: item.patientDetailsDTO.gender,
          age: item.patientDetailsDTO.age,
          status: item.status,
          scanType: item.slides?.[0]?.organ || "--",
          scanNumber: item?.slides?.length || 0,
          date: item.date,
        };
      });

      setPage((st) => ({
        ...st,
        total: casesList?.totalElements,
        current: currentPage,
      }));

      setTableData(() => formattedRows);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(() => false);
    }
  };

  const handlePagination = (page) => {
    fetchRadiologyTableData(page - 1, search);
  };

  const handleSearchDebounce = useCallback(
    _.debounce((searchValue) => fetchRadiologyTableData(0, searchValue), 500),
    []
  );

  const handleSearch = (e) => {
    let value = e.target.value;
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    setSearch(() => value);

    handleSearchDebounce(value);
  };

  const handleDateSort = (sortOrder) => {
    let newSort;

    if (sortOrder === "ascend") {
      newSort = "date,asc";
    } else if (sortOrder === "descend") {
      newSort = "date,desc";
    } else {
      newSort = null;
    }

    setSort(newSort);
  };

  useEffect(() => {
    fetchRadiologyTableData(page.current ?? 0, search);
  }, [sort, reset]);

  const showCaseDrawer = () => {
    setCaseDrawer(() => true);
  };

  const hideCaseDrawer = () => {
    setCaseDrawer(() => false);
  };

  const handleNavigate = (record) => {
    navigate(`/radiology/scan-details/${record.id}/case-details`);
  };

  return (
    <DashboardTemplate heading="Radiology">
      {caseDrawer && (
        <CaseDetailDrawer
          open={caseDrawer}
          caseType="RADIOLOGY"
          onClose={hideCaseDrawer}
          redirectTo="/radiology/scan-details"
          fileFormat={["tif", "tiff", "dcm", "dicom"]}
          uploadLabel="Upload Scan"
          setReset={setReset}
          maxFileSize={RADIOLOGY_MAX_FILE_SIZE}
        />
      )}

      <section className="admin-table-fields-container">
        <h4 className="tabs-heading">List of Radiology</h4>

        <article className="table-search-fields-container">
          <Input
            inputType="searchField"
            name="search"
            placeholder="Search by MRN"
            value={search}
            onChange={handleSearch}
          />

          <Button
            title="Add New Case"
            classes="add-filter-button"
            icon={<PlusIcon />}
            handleClick={showCaseDrawer}
          />
        </article>
      </section>

      <Table
        columns={radiologyTableColumns(handleNavigate, handleDateSort, sort)}
        data={tableData}
        loading={loading}
        page={page}
        handlePagination={handlePagination}
        classes="large-table-body"
      />
    </DashboardTemplate>
  );
};

export default Radiology;
