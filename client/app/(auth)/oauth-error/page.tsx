import Link from "next/link";

type Props = {
  searchParams: Promise<{
    error: string;
    error_description?: string;
  }>;
};

async function OauthErrorPage({ searchParams }: Props) {
  const { error, error_description: errorMessage } = await searchParams;

  let message = errorMessage;
  if (error === "account_not_linked" && !message) {
    message =
      "This could be because you already have an account that uses a different login method. You can delete your existing account and then sign up again using a different login method.";
  }

  return (
    <section className="px-3">
      <h2 className="mb-4 text-center">Login</h2>

      <p className="mb-4">An error has occurred during the sign-in process.</p>

      <p>
        Error code: <span className="text-warning">{error}</span>
      </p>
      {message && (
        <p className="mt-2">
          Error message: <span>{message}</span>
        </p>
      )}

      <Link href="/login" className="d-block mt-4">
        Back to login page
      </Link>
    </section>
  );
}

export default OauthErrorPage;
