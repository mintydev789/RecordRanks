import ToastMessages from "~/app/components/UI/ToastMessages.tsx";

type Props = {
  children: React.ReactNode;
};

function MembersLayout({ children }: Props) {
  return (
    <section>
      <h2 className="mb-4 text-center">Manage Members</h2>

      <ToastMessages className="mx-2" />

      {children}
    </section>
  );
}

export default MembersLayout;
