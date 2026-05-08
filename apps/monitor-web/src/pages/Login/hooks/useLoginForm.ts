import { ChangeEvent, FormEvent, useState } from "react";
import { useLoginMutation } from "@/queries";
import { LoginFormValues } from "../types";

const useLoginForm = () => {
  const [values, setValues] = useState<LoginFormValues>({ username: "", password: "" });
  const { mutateAsync: login, isPending } = useLoginMutation();

  const handleChange =
    (field: "username" | "password") => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    await login(values);
  };

  const isDisabled = isPending || !values.username.trim() || !values.password.trim();

  return { values, handleChange, handleSubmit, isDisabled, isPending };
};

export default useLoginForm;
