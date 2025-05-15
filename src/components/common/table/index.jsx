import React from "react";
import { Table as AntdTable, Pagination } from "antd";

import "./styles.scss";

const Table = (props) => {
  const { columns, data, loading, page, handlePagination, classes, showPagination = true,} = props;

  return (
    <section className="table-wrapper">
      <AntdTable
        className={`common-table-container ${classes}`}
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ y: 300 }}
        pagination={false}
      />

      {showPagination && data?.length > 0 && (
        <p className="pagination-count">
          Showing <strong>{data.length}</strong> Entities
        </p>
      )}

     {showPagination && (
      <Pagination
        className="custom-pagination"
        current={page?.current + 1 || 1}
        pageSize={page?.size || 10}
        total={page?.total || 0}
        showSizeChanger={false}
        onChange={(current) => {
          handlePagination(current);
        }}
      />
    )}
    </section>
  );
};

export default Table;
