import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Input, Button } from "@/components/common";
import { getUserData } from "@/utils/storage";
import { hideFields } from "./caseTransferDrawerUtils";

const Form = (props) => {
  const { submitDiagnosisDetail, diagnosisData } = props;
  const { role: userRole } = getUserData();

  const shouldHideFields = hideFields.includes(userRole);

  const caseTransferFormSchema = yup.object().shape({
    diagnosis: yup.string().required("Diagnosis is required"),
    microscopy: yup.string(),
    gross: yup.string(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(caseTransferFormSchema),
    defaultValues: diagnosisData || {
      diagnosis: "",
      microscopy: "",
      gross: "",
    },
    mode: "all",
  });

  return (
    <>
      <section className="transfer-case-drawer-form-wrapper">
        {!shouldHideFields && (
          <>
            <Controller
              name="gross"
              control={control}
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    inputType="textarea"
                    label="Gross"
                    placeholder=""
                    height="170px"
                    errors={errors}
                  />
                );
              }}
            />

            <Controller
              name="microscopy"
              control={control}
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    inputType="textarea"
                    label="Microscopy"
                    placeholder=""
                    height="170px"
                    errors={errors}
                  />
                );
              }}
            />
          </>
        )}

        <Controller
          name="diagnosis"
          control={control}
          render={({ field }) => {
            return (
              <Input
                {...field}
                label="Diagnosis"
                inputType="textarea"
                placeholder=""
                height="170px"
                required={true}
                errors={errors}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z ]/g, "");
                  field.onChange(value);
                }}
              />
            );
          }}
        />
      </section>

      <div class="transfer-case-drawer-footer-wrapper">
        <Button
          title="Next"
          handleClick={handleSubmit(submitDiagnosisDetail)}
          disabled={!isValid || isSubmitting}
        />
      </div>
    </>
  );
};

export default Form;
