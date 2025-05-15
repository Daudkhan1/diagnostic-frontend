import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Input, Select, Button } from "@/components/common";
import { NationIDIcon } from "@/assets/svg";
// import {
//   NATIONAL_ID_REGEX,
//   PHONE_NUMBER_REGEX,
//   EMAIL_REGEX,
// } from "../../utils/regex";

const Form = (props) => {
  const { existID, formData, handleCreateCase } = props;

  const caseDetailFormSchema = existID
    ? yup.object().shape({
        age: yup.string().required("Age is required"),
        gender: yup.string().required("Gender is required"),
      })
    : yup.object().shape({
        age: yup.string().required("Age is required"),
      });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(caseDetailFormSchema),
    defaultValues: {
      id: formData.id,
      mrn: formData.mrn,
      age: formData.age,
      gender: formData.gender,
    },
    mode: "all",
  });

  return (
    <>
      <span className="form-icon">
        <NationIDIcon />
      </span>

      {!existID ? (
        <>
          <p className="main-heading">Patient not exists</p>

          <p className="caption">Please provide patient details.</p>
        </>
      ) : (
        <>
          <p className="main-heading">Patient already exists</p>
        </>
      )}

      {!existID ? (
        <section className="patient-details-form-wrapper">
          <Controller
            name="age"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  {...field}
                  defaultValue={formData.gender}
                  label="Age"
                  placeholder="Enter Age"
                  height="54px"
                  required={true}
                  errors={errors}
                  maxLength={3}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "").slice(0, 3);
                    if (value.length === 1 && value === "0") {
                      value = "";
                    }
                    field.onChange(value);
                  }}
                />
              );
            }}
          />

          <Controller
            name="gender"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  label="Gender"
                  required={true}
                  errors={errors}
                  options={[
                    { value: "male", label: "Male" },
                    {
                      value: "female",
                      label: "Female",
                    },
                  ]}
                  height="54px"
                />
              );
            }}
          />
        </section>
      ) : (
        <section className="patient-details-prefilled-wrapper">
          <article className="field-container">
            <p className="label">PRAID Patient ID</p>
            <p className="value">{formData?.formattedPraidId}</p>
          </article>

          <article className="field-container">
            <p className="label">Gender</p>
            <p className="value">{formData?.gender}</p>
          </article>

          <Controller
            name="age"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  {...field}
                  defaultValue={formData.gender}
                  label="Age"
                  placeholder="Enter Age"
                  height="54px"
                  required={true}
                  errors={errors}
                  maxLength={3}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "").slice(0, 3);
                    if (value.length === 1 && value === "0") {
                      value = "";
                    }
                    field.onChange(value);
                  }}
                />
              );
            }}
          />
        </section>
      )}

      <Button
        classes="drawer-continue-button"
        title="Continue"
        handleClick={handleSubmit(handleCreateCase)}
        disabled={!isValid || isSubmitting}
      />
    </>
  );
};

export default Form;
