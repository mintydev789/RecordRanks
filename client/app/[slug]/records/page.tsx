import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function RecordsRedirectPage({ params }: Props) {
  const { slug } = await params;

  // TO-DO: MAKE THIS DYNAMICALLY USE THE FIRST EVENT CATEGORY!!!
  redirect(`/${slug}/records/unofficial`, "replace");
}

export default RecordsRedirectPage;
