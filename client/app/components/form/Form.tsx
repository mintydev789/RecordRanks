"use client";

import Button from "~/app/components/UI/Button.tsx";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";

type Props = {
  children: React.ReactNode;
  hideToasts?: boolean;
  isLoading?: boolean;
  disableControls?: boolean;
  onCancel?: () => void;
} & (
  | {
      buttonText?: string;
      hideSubmitButton?: boolean;
      onSubmit: () => void;
    }
  | {
      buttonText?: never;
      hideSubmitButton: true;
      onSubmit?: never;
    }
) &
  React.HTMLAttributes<HTMLFormElement>;

function Form({
  children,
  buttonText = "Submit",
  hideToasts = false,
  hideSubmitButton = false,
  isLoading = false,
  disableControls = false,
  onSubmit,
  onCancel,
  className,
}: Props) {
  const controlsDisabled = disableControls || isLoading;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={`fs-5 container mx-auto my-4 px-3 ${className}`}
      style={{ maxWidth: "var(--rr-md-width)" }}
    >
      {!hideToasts && <ToastMessages />}

      {children}

      {(!hideSubmitButton || onCancel) && (
        <div className="d-flex mt-md-3 gap-3">
          {!hideSubmitButton && (
            <Button
              id="form_submit_button"
              type="submit"
              onClick={onSubmit}
              disabled={controlsDisabled}
              isLoading={isLoading}
            >
              {buttonText}
            </Button>
          )}
          {onCancel && (
            <Button id="form_cancel_button" onClick={onCancel} disabled={controlsDisabled} className="btn-danger">
              Cancel
            </Button>
          )}
        </div>
      )}
    </form>
  );
}

export default Form;
