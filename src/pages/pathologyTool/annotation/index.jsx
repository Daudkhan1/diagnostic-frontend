import { useState, useEffect, useCallback,useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import _ from "lodash";
import { toast } from "react-toastify";
import { Dropdown } from "antd";

import {
  DashboardTemplate,
  DashboardCard,
  CaseTransferDrawer,
} from "@/components";
import { Radio, Table, Modal, Button, Input, FilterPanel } from "@/components/common";
import {
  annotationCards,
  annotationTableOptions,
  annotationTableColumns,
} from "@/constants/annotationTableColumns";
import {
  getAllCases,
  fetchCaseStatistics,
  assignCaseToMe,
  unAssignCaseToMe,
  getLatestCaseStatus,
} from "@/services/caseService";
import { getOrganOptions } from "@/services/slideService";
import { getUserData } from "@/utils/storage";
import { genericError } from "@/utils/helpers";
import { FilterIcon } from "@/assets/svg";

const Annotation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageState = location.state?.page;
  const locationType = location.state?.type;

  const { role, id, email: currentUserEmail } = getUserData();
  const defaultType = "NEW";

  const [sort, setSort] = useState(null);
  const [type, setType] = useState(locationType ?? defaultType);
  const [tableData, setTableData] = useState();
  const [open, setOpen] = useState(false);
  const [organs, setOrgans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [caseStats, setCaseStats] = useState({});
  const [page, setPage] = useState({
    size: 10,
    current: pageState ?? 0,
    total: 0,
  });
  const [reset, setReset] = useState(false);
  const typeRef = useRef(type);

  const navigateToCase = (record) => {
    navigate(`/pathology-annotation-tool/${record.id}/case-details`, {
      state: { page: page?.current, type: type },
    });
  };
  
  useEffect(() => {
    typeRef.current = type;
  }, [type]);
  
  const handleTableChange = (e) => {
    const typeSelected = e.target.value;
    setType(typeSelected);
    setPage((prevPage) => ({
      ...prevPage,
      current: 0,
    }));
  };

  const fetchCardsData = async () => {
    try {
      const data = await fetchCaseStatistics("PATHOLOGY");
      setCaseStats(() => data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCardsData();
  }, [reset]);

  const fetchPathologyTableData = async (pageNo, searchValue, appliedFilters = {}) => {
    setLoading(true);

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

   const buildFilterQuery = () => {
    const excludedKeys = ["type", "status", "page", "size"];
    if (!appliedFilters || Object.keys(appliedFilters).length === 0) {
      return "";
    }
    return Object.entries(appliedFilters)
      .filter(([key, value]) => !excludedKeys.includes(key) && value !== "" && value !== 0)
      .map(([key, value]) => `&${key}=${value}`)
      .join("");
  };

    // const statusType = getStatus(type);
    const currentPage = pageNo ?? page.current;
    const searched = getSearchedValue();
    const sorted = getSortedValue();
    const filterQuery = buildFilterQuery();
    const currentType = typeRef.current;
    try {
      const casesList = await getAllCases(
        `?type=PATHOLOGY&status=${currentType}&size=${page.size}&page=${currentPage}${searched}${sorted}${filterQuery}`
      );

      const formattedRows = casesList?.content?.map((item) => {
        return {
          ...item,
          key: item.id,
          patientID: item.patientDetailsDTO.praidId,
          case: item.caseName,
          gender: item.patientDetailsDTO.gender,
          age: item.patientDetailsDTO.age,
          patientName: `${item.patientDetailsDTO.firstName} ${item.patientDetailsDTO.lastName}`,
          status: item.status,
          date: item.date,
          transferredTo: item.transferDetails?.transferredTo,
          transferredBy: item.transferDetails?.transferredBy,
        };
      });

      setPage((st) => ({
        ...st,
        total: casesList?.totalElements,
        current: currentPage,
      }));
      setTableData(formattedRows);
    } catch (err) {
      toast.error(genericError(err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplyFilters = (filterData) => {
    const isEmptyFilterData = Object.values(filterData).every(
      (value) => value === "" || value === 0
    );
    if (!isEmptyFilterData) {
      const updatedFilters = { ...filterData };
      fetchPathologyTableData(0, undefined, updatedFilters);
    }
  };

  const handleResetFilters = () => {
    fetchPathologyTableData(page.current, search, null);
  };

  const fetchOrganOptions = async () => {
    try {
      setLoading(true);
      const response = await getOrganOptions();
      if (response.data && response.data.length > 0) {
        const transformedOrgans = response.data.map((option) => ({
          value: option,
          label: option
        }));
        setOrgans(transformedOrgans);
      }
    } catch (error) {
      console.error("Failed to fetch organ options", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value) => {
    setOpen(value);
  };

  const handlePagination = (page) => {
    fetchPathologyTableData(page - 1, search);
  };

  const handleSearchDebounce = useCallback(
    _.debounce((searchValue) => fetchPathologyTableData(0, searchValue), 500),
    []
  );

  const handleSearch = (e) => {
    let value = e.target.value;
    if (/[{}\[\]|?\\#$%^&*()`]/.test(value)) {
      return;
    }
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    setSearch(value);
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
    fetchPathologyTableData(page.current, search);
  }, [type, sort, page.current, reset]);

  useEffect(() => {
    fetchOrganOptions()
  }, []);

  const options = annotationTableOptions(role)?.filter((item) => {
    if (item) {
      return item;
    }
  });

  const [assignModal, setAssignModal] = useState({
    visible: false,
    record: {},
  });

  const showAssignModal = (record) => {
    setAssignModal(() => ({
      visible: true,
      record,
    }));
  };

  const hideAssignModal = () => {
    setAssignModal(() => ({
      visible: false,
      record: {},
    }));
  };

  const handleAssignCase = async () => {
    try {
      await assignCaseToMe(assignModal.record.id);
    } catch (err) {
      toast.error(err.response.data || err.message);
    } finally {
      setReset((st) => !st);
      hideAssignModal();
    }
  };

  const [unassignModal, setUnassignModal] = useState({
    modal: false,
    history: false,
    record: {},
  });

  const showUnassignModal = (record) => {
    const hasAnnotations = record?.slides?.some(
      (slide) => slide.annotationCount > 0
    );

    const userHasCommented = record?.comments?.some(
      (comment) => comment.creationUser === currentUserEmail
    );

    if (hasAnnotations || userHasCommented) {
      setUnassignModal(() => ({
        history: true,
        record,
      }));
    } else {
      setUnassignModal(() => ({
        visible: true,
        record,
      }));
    }
  };

  const hideUnassignModal = () => {
    setUnassignModal(() => ({
      visible: false,
      history: false,
      record: {},
    }));
  };

  const handleUnAssignCase = async (isDeleteAnnotations = true) => {
    try {
      await unAssignCaseToMe(unassignModal.record.id, isDeleteAnnotations);
    } catch (error) {
      toast.error(error);
    } finally {
      setReset((st) => !st);
      hideUnassignModal();
    }
  };

  const [transferModal, setTransferModal] = useState({
    prompt: false,
    drawer: false,
    record: {},
  });

  const isAllSlidesCompleted = (record) =>
    record?.slides?.length > 0 &&
    record.slides.every((slide) => slide.status === "COMPLETED");

  const showTransferModal = (record) => {
    const allSlidesCompleted = isAllSlidesCompleted(record);

    if (allSlidesCompleted) {
      setTransferModal(() => ({
        drawer: true,
        record,
      }));
    } else {
      setTransferModal(() => ({
        prompt: true,
        record,
      }));
    }
  };

  const hideTransferModal = () => {
    setTransferModal(() => ({
      prompt: false,
      drawer: false,
      record: {},
    }));
  };

  const [latestCaseStatus, setLatestCaseStatus] = useState(null);
  const [completeModal, setCompleteModal] = useState({
    drawer: false,
    record: {},
  });

  const fetchLatestCaseStatus = async (record) => {
    try {
      const response = await getLatestCaseStatus(record.id);
      setLatestCaseStatus(response);
    } catch (error) {
      console.error(error);
    }
  };

  const showCompleteModal = async (record) => {
    const allSlidesCompleted = isAllSlidesCompleted(record);

    if (allSlidesCompleted) {
      await fetchLatestCaseStatus(record);

      setCompleteModal(() => ({
        drawer: true,
        record,
      }));
    } else {
      setTransferModal(() => ({
        prompt: true,
        record,
      }));
    }
  };

  const hideCompleteModal = () => {
    hideTransferModal();
    setCompleteModal(() => ({
      drawer: false,
      record: {},
    }));
  };

  return (
    <DashboardTemplate heading="Pathology Tool">
      {completeModal.drawer && (
        <CaseTransferDrawer
          open={completeModal.drawer}
          onClose={hideCompleteModal}
          latestCaseStatus={latestCaseStatus}
          caseID={completeModal.record.id}
          setReset={setReset}
        />
      )}

      {transferModal.drawer && (
        <CaseTransferDrawer
          open={transferModal.drawer}
          onClose={hideTransferModal}
          caseID={transferModal.record.id}
          transfer={true}
          setReset={setReset}
        />
      )}

      {transferModal.prompt && (
        <Modal
          title="Alert"
          alertIcon
          open={transferModal.prompt}
          onCancel={hideTransferModal}
          footer={[
            <Button key="save" title="Ok" handleClick={hideTransferModal} />,
          ]}
        >
          <p className="status-update">
            To transfer this case you need to complete all slides.
          </p>
        </Modal>
      )}

      {unassignModal.history && (
        <Modal
          title="Alert"
          alertIcon
          open={unassignModal.history}
          onCancel={hideUnassignModal}
          footer={[
            <Button
              key="delete"
              title="No"
              classes="simple"
              handleClick={() => handleUnAssignCase()}
            />,
            <Button
              key="save"
              title="Yes"
              handleClick={() => handleUnAssignCase(false)}
            />,
          ]}
        >
          <p className="status-update">
            Do you want to save your changes (annotations/comments) before
            unassigning this case?
          </p>
        </Modal>
      )}

      {unassignModal.visible && (
        <Modal
          title="Alert"
          alertIcon
          open={unassignModal.visible}
          onCancel={hideUnassignModal}
          footer={[
            <Button
              key="delete"
              title="No"
              classes="simple"
              handleClick={hideUnassignModal}
            />,
            <Button
              key="save"
              title="Yes"
              handleClick={() => handleUnAssignCase(false)}
            />,
          ]}
        >
          <p className="status-update">
            Are you sure do you want to unassign this case?
          </p>
        </Modal>
      )}

      {assignModal.visible && (
        <Modal
          title="Alert"
          alertIcon
          open={assignModal.visible}
          onCancel={hideAssignModal}
          footer={[
            <Button
              title="No"
              classes="simple"
              handleClick={hideAssignModal}
            />,
            <Button title="Yes" handleClick={handleAssignCase} />,
          ]}
        >
          <p className="status-update">
            Are you sure you want to assign this case?
          </p>
        </Modal>
      )}

      <section className="admin-cards-list">
        {annotationCards(caseStats).map((card, index) => (
          <DashboardCard key={`annotation-card-${index}`} {...card} />
        ))}
      </section>

      <section className="admin-table-fields-container">
        <Radio
          options={options}
          value={type}
          onChange={handleTableChange}
          defaultValue={defaultType}
          disabled={loading}
        />

        <article className="table-search-fields-container">
          <Input
            inputType="searchField"
            name="search"
            placeholder="Search by MRN"
            value={search}
            onChange={handleSearch}
            maxLength={40}
            width={296}
          />
          <Dropdown
            open={open}
            onOpenChange={handleOpenChange}
            getPopupContainer={(trigger) => trigger.parentNode}
            dropdownRender={() => (
              <div className="filter-panel-wrapper">
                <div className="filter-panel-inner">
                <FilterPanel
                  onApply={handleApplyFilters}
                  organs={organs}
                  handleResetFilters={handleResetFilters}
                />
                </div>
              </div>
            )}
            trigger={['click']}
          >
            <div>
              <Button
                title="Filters"
                classes={open ? "" : "filter-btn"} 
                icon={<FilterIcon />}
              />
            </div>
          </Dropdown>
        </article>
      </section>

      <Table
        columns={annotationTableColumns(
          navigateToCase,
          handleDateSort,
          sort,
          type,
          showAssignModal,
          showUnassignModal,
          showTransferModal,
          showCompleteModal
        )}
        data={tableData}
        loading={loading}
        page={page}
        handlePagination={handlePagination}
      />
    </DashboardTemplate>
  );
};

export default Annotation;
