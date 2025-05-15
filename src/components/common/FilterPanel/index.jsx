import { useForm, Controller } from "react-hook-form";
import { DatePicker } from "antd";

import { Button, Select } from "@/components/common";
import { formatToISODateTime } from "@/utils/dateUtils";
import "./styles.scss";

const FilterPanel = ({
  onApply,
  organs = [],
  handleResetFilters,
  classes = "",
}) => {
    const {
        control,
        handleSubmit,
        reset,
        setValue
        } = useForm({
        mode: "all",
        defaultValues: {
            minAge: "",  
            maxAge: "",
            gender: "",
            organ: "",
            startDateTime: null,
            endDateTime: null,
        },
    });

    const handleFormSubmit = (data) => {
      const filterData = {
        organ: data.organ,  
        startDate: data.startDateTime ? formatToISODateTime(new Date(data.startDateTime)) : "",  
        endDate: data.endDateTime ? formatToISODateTime(new Date(data.endDateTime)) : "", 
        gender: data.gender,  
        minAge: Number(data.minAge),
        maxAge: Number(data.maxAge), 
      };
    
      onApply(filterData);
    };

  const handleReset = () => {
    reset();
    handleResetFilters(); 
  };
    
  return (
    <section
      className={`filter-panel-container ${classes}`}
    >
      <section className="filter-panel-row distribute">
        <article  className="filter-field">
          <label className="custom-label">Start Date</label>
          <Controller
            name="startDateTime"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                format="DD MMM, YYYY"
                onChange={(date) => field.onChange(date)}
              />
            )}
          />
        </article >

        <article  className="filter-field">
          <label className="custom-label">End Date</label>
          <Controller
            name="endDateTime"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                format="DD MMM, YYYY"
                onChange={(date) => field.onChange(date)}
              />
            )}
          />
        </article >
      </section>

      <section className="filter-panel-row">
        <article className="filter-field">
          <Controller
            name="organ"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                selectType="common"
                label="Organ Type"
                options={organs}
              />
            )}
          />
        </article >
      </section>

      <section className="filter-panel-row distribute">
        <article  className="filter-field">
          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                selectType="common"
                label="Age"
                options={[
                  { value: "20 - 30", label: "20 - 30" },
                  { value: "30 - 40", label: "30 - 40" },
                  { value: "40 - 50", label: "40 - 50" },
                  { value: "50 - 60", label: "50 - 60" },
                  { value: "60 - 70", label: "60 - 70" },
                  { value: "70 - 80", label: "70 - 80" },
                  { value: "80 - 90", label: "80 - 90" },
                  { value: "90 - 100", label: "90 - 100" },
                ]}
                onChange={(value) => {
                  const [minAge, maxAge] = value.split(" - ").map(Number);
                  field.onChange(value); 
                  setValue("minAge", minAge);
                  setValue("maxAge", maxAge);
                }}
              />
            )}
          />
        </article >


        <section className="filter-field">
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                selectType="common"
                label="Gender"
                options={[
                  { value: "male", label: "Male" },
                  {
                    value: "female",
                    label: "Female",
                  },
                ]}
              />
            )}
          />
        </section>
      </section>

      <section className="filter-actions">
        <Button
          key="reset"
          title="Reset"
          handleClick={handleReset }
          classes="filter-panel-button reset"
        />
        <Button
          key="apply"
          title="Apply Filter"
          classes="filter-panel-button apply"
          handleClick={handleSubmit(handleFormSubmit)}
        />
      </section>
    </section>
  );
};

export default FilterPanel;
