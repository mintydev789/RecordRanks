type Props = {
  importantInfo: string | null;
} & React.HTMLAttributes<HTMLParagraphElement>;

function EventImportantInfo({ importantInfo, className = "" }: Props) {
  if (!importantInfo) return;

  return (
    <p className={className}>
      Please note:
      <span className="fw-bold ms-2 text-danger">{importantInfo}</span>
    </p>
  );
}

export default EventImportantInfo;
