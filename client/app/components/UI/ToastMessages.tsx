"use client";

import { useContext, useEffect } from "react";
import { MainContext } from "~/helpers/contexts.ts";

type Props = React.HTMLAttributes<HTMLElement>;

function ToastMessages({ className }: Props) {
  const { errorMessages, successMessage } = useContext(MainContext);

  useEffect(() => {
    if (successMessage || errorMessages.some((msg: string) => msg !== "")) {
      document
        .getElementById(successMessage ? "success_message" : "error_message_1")
        ?.scrollIntoView({ block: "center" });
    }
  }, [successMessage, errorMessages]);

  if (errorMessages.length > 0) {
    return errorMessages.map((message: string, index: number) => (
      <div
        key={index.toString()}
        id={`error_message_${index + 1}`}
        className={`alert alert-danger ${className}`}
        style={{ whiteSpace: "pre-wrap" }}
        role="alert"
      >
        {message}
      </div>
    ));
  }

  if (successMessage) {
    return (
      <div
        id="success_message"
        className={`alert alert-success ${className}`}
        style={{ whiteSpace: "pre-wrap" }}
        role="alert"
      >
        {successMessage}
      </div>
    );
  }
}

export default ToastMessages;
